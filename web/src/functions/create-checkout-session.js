import Stripe from 'stripe';
import { DateTime } from 'luxon';
import Sentry from '@sentry/serverless';
import client from '../../config/utils/sanityClient.js';
import { generateDummyEmail, getCommitRef, isProduction } from '../../config/functions/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENV,
  release: `the-number-ninja@${getCommitRef()}`,
  beforeSend(event, hint) {
    // Don't send events if it's not production
    if (!isProduction()) {
      return null;
    }

    return event;
  },

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const respond = (statusCode, body) => {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(body, null, 2),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log('➡️  Response:', response);

  return response;
};

async function getTaxRate() {
  for await (const rate of stripe.taxRates.list()) {
    if (rate['display_name'] === 'VAT' && rate['percentage'] === 20.0 && !rate['inclusive']) {
      return rate;
    }
  }

  throw 'No VAT tax rate configured in Stripe';
}

const handler = Sentry.AWSLambda.wrapHandler(async (event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method Not Allowed' });
  }

  const { configuration: clientId, baseUrl } = JSON.parse(event.body);
  const errorMessageForUser =
    'There was an unexpected error when attempting to start the subscription. Please try again later.';

  if (!clientId || !baseUrl) {
    console.error('💣 Client ID or base URL was not provided in request', event);

    return respond(400, { error: errorMessageForUser });
  }

  try {
    const taxRate = await getTaxRate();
    const session = await createSession(clientId, baseUrl, taxRate.id);
    console.log('🔧 Created session', session.id);

    return respond(200, { session_url: session.url });
  } catch (err) {
    Sentry.captureException(err);
    console.error('💣 Stripe error:', err);
    console.log('🔎 Event:', event);

    let statusCode = 500;
    if (err.statusCode) {
      statusCode = err.statusCode;
    }

    const body = {
      error: errorMessageForUser,
    };

    return respond(statusCode, body);
  }
});

async function getCustomer(email) {
  const customersWithEmail = [];

  for await (const customer of stripe.customers.list({ email })) {
    customersWithEmail.push(customer);
  }

  const numberCustomersWithEmail = customersWithEmail.length;

  if (numberCustomersWithEmail === 0) {
    console.log(
      `🙅‍♀️ No existing customer found with email ${email}. A new one will be created during checkout.`
    );

    return null;
  }

  const chosenMatchingCustomer = customersWithEmail[0];

  if (numberCustomersWithEmail > 1) {
    console.log(
      `👨‍👩‍👧‍👧 Found ${numberCustomersWithEmail} with email ${email} so defaulting to the first match (${chosenMatchingCustomer.id}).`
    );
  }

  return chosenMatchingCustomer;
}

function generateMonthlyProductLineItems(products) {
  return products
    .filter(product => product._type === 'monthlyProduct')
    .map(product => {
      if (product.priceId) {
        return {
          price: product.priceId,
          quantity: product.quantity,
        };
      }

      // Extra monthly jobs
      return {
        quantity: 1,
        price_data: {
          product_data: {
            name: product.name,
          },
          currency: 'gbp',
          unit_amount: product.amount,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
      };
    });
}

function generateOneOffLineItems(products) {
  return products
    .filter(product => product._type === 'oneOffProduct')
    .map(product => {
      const { name, amount } = product;
      return {
        quantity: 1,
        price_data: {
          product_data: {
            name,
          },
          currency: 'gbp',
          unit_amount: amount,
        },
      };
    });
}

function calculateRemainingContractMonths(agreementEndDate) {
  const today = DateTime.now().startOf('day');
  const agreementEnd = DateTime.fromFormat(agreementEndDate, 'yyyy-MM-dd');

  return Math.ceil(agreementEnd.diff(today, 'months').months);
}

function generateAccountsLineItems(products, agreementEndDate) {
  const lineItems = [];

  products
    .filter(product => product._type === 'accountsProduct')
    .forEach(product => {
      const { name, amount, priceId, quantity } = product;
      let catchUpMonths = calculateNumberOfCatchUpMonths(product['yearEnd']);

      // Avoid having a catch-up fee with a single monthly payment before they're all paid up for the agreement
      if (catchUpMonths === 11) {
        catchUpMonths = 12;
      }

      // Need to add future subscription items
      if (catchUpMonths < 12) {
        lineItems.push({
          price: priceId,
          quantity: quantity,
        });
      }

      if (catchUpMonths === 0) {
        return;
      }

      const catchUpLineItem = {
        quantity: 1,
        price_data: {
          product_data: {},
          currency: 'gbp',
        },
      };

      // For year ends that have already passed, take the entire amount now
      // For year ends that end in the future, split the catch-up fee across the remaining months
      if (catchUpMonths == 12) {
        catchUpLineItem.price_data.product_data.name = `${name} (12 months alignment fee)`;
        catchUpLineItem.price_data.unit_amount = amount * 12;
      } else {
        // Work-around because descriptions are not shown on checkout page for subscriptions
        const month = catchUpMonths === 1 ? 'month' : 'months';
        const totalCatchUpFee = amount * catchUpMonths;
        let remainingContractMonths = calculateRemainingContractMonths(agreementEndDate);
        // Make sure we never calculate a negative number of catch-up months
        if (remainingContractMonths <= 0) {
          remainingContractMonths = 1;
        }
        const alignmentFeeDescription = ` (${catchUpMonths} ${month} alignment fee paid over ${remainingContractMonths} month${remainingContractMonths > 1 ? 's' : ''})`;
        catchUpLineItem.price_data.product_data.name = `${name}${catchUpMonths < 12 ? alignmentFeeDescription : ''}`;
        catchUpLineItem.price_data.unit_amount = Math.ceil(
          totalCatchUpFee / remainingContractMonths
        );
        catchUpLineItem.price_data['recurring'] = {
          interval: 'month',
        };
      }

      lineItems.push(catchUpLineItem);
    });

  return lineItems;
}

function determineMode(lineItems) {
  if (lineItems.filter(item => Object.hasOwn(item, 'price')).length > 0) {
    return 'subscription';
  }

  return 'payment';
}

function calculateTrialEnd(startDate) {
  const now = DateTime.now();
  const agreementStartDate = DateTime.fromFormat(startDate, 'yyyy-MM-dd');

  if (agreementStartDate < now) {
    return null;
  }

  // Stripe requires that trials end at least 2 days in the future.
  // End the trial in 2 days if the agreement starts before then.
  if (agreementStartDate.diff(now, 'days').days < 2) {
    return now.plus({ hours: 48 }).toUnixInteger();
  }

  return agreementStartDate.toUnixInteger();
}

async function getConfiguration(clientId) {
  const filter = `*[_type == "client" && !(_id in path("drafts.**")) && clientId == "${clientId}"][0] {
    name,
    email,
    subscription,
  }`;

  return await client.fetch(filter).catch(err => console.error(err));
}

async function createDiscountCoupon(discountConfiguration) {
  if (!discountConfiguration) {
    return [];
  }

  let params = {
    name: discountConfiguration.description,
    duration: 'forever',
  };

  if (discountConfiguration.amount) {
    params = {
      ...params,
      amount_off: discountConfiguration.amount,
      currency: 'GBP',
    };
  } else {
    params['percent_off'] = discountConfiguration.percentage;
  }

  return [
    {
      coupon: (await stripe.coupons.create(params)).id,
    },
  ];
}

async function createSession(clientId, baseUrl, taxRateId) {
  const configuration = await getConfiguration(clientId);
  const email = isProduction() ? configuration.email : generateDummyEmail(configuration.email);

  const payload = {
    success_url: `${baseUrl}?state=success`,
    cancel_url: `${baseUrl}?state=cancelled`,
    payment_method_types: ['card'],
    name_collection: {
      business: {
        enabled: true,
        optional: false,
      },
      individual: {
        enabled: true,
        optional: false,
      }
    }
  };

  const customer = await getCustomer(email);

  if (customer) {
    payload['customer'] = customer.id;
  } else {
    payload['customer_email'] = email;
  }
  const subscriptionConfiguration = configuration.subscription;

  const lineItems = [
    ...generateMonthlyProductLineItems(subscriptionConfiguration.products),
    ...generateAccountsLineItems(
      subscriptionConfiguration.products,
      subscriptionConfiguration.agreement.end
    ),
    ...generateOneOffLineItems(subscriptionConfiguration.products),
  ];

  const paymentMode = determineMode(lineItems);
  payload['mode'] = paymentMode;
  payload['line_items'] = lineItems;

  payload['discounts'] = await createDiscountCoupon(subscriptionConfiguration.discount);

  if (paymentMode === 'subscription') {
    payload['payment_method_types'].push('bacs_debit');
    payload['subscription_data'] = {};
    payload['subscription_data']['default_tax_rates'] = [taxRateId];
    payload['subscription_data']['metadata'] = {
      client_id: clientId,
      client_name: configuration.name,
    };

    if ('agreement' in subscriptionConfiguration) {
      const trialEndDate = calculateTrialEnd(subscriptionConfiguration.agreement.start);
      if (trialEndDate) {
        payload['subscription_data']['trial_end'] = trialEndDate;
      }
    }
  }

  if (paymentMode === 'payment') {
    payload['payment_intent_data'] = {
      metadata: {
        client_id: clientId,
        client_name: configuration.name,
      },
      // Allow us to take future payments. We need this in case we have another agreement with the client to provide
      // services in future. Otherwise they may have to subscribe again.
      setup_future_usage: 'off_session',
    };

    // Tax information needs to be set per-item if no subscription is started with the checkout session.
    for (const lineItem of payload['line_items']) {
      lineItem.tax_rates = [taxRateId];
    }
  }

  console.log('📨', JSON.stringify(payload, null, 2));

  const session = await stripe.checkout.sessions.create(payload);

  return { id: session.id, url: session.url };
}

function calculateNumberOfCatchUpMonths(yearEnd) {
  const now = DateTime.now().startOf('day');
  const yearEndDate = DateTime.fromFormat(yearEnd, 'yyyy-MM-dd');

  if (yearEndDate < now) {
    return 12;
  }

  const months = 12 - Math.ceil(yearEndDate.diff(now, 'months').months);

  // Financial year hasn't started
  if (months < 0) {
    return 0;
  }

  return months;
}

export {
  handler,
  calculateNumberOfCatchUpMonths,
  generateAccountsLineItems,
  calculateRemainingContractMonths,
};
