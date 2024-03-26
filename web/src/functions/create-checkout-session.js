const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const moment = require('moment')
const Sentry = require('@sentry/serverless')
const client = require('../../config/utils/sanityClient')
const {generateDummyEmail, getCommitRef, isProduction} = require('../../config/functions/index')

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENV,
  release: `the-number-ninja@${(getCommitRef())}`,
  beforeSend(event, hint) {
    // Don't send events if it's not production
    if (!isProduction()) {
      return null
    }

    return event
  },

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

const respond = (statusCode, body) => {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(body, null, 2),
    headers: {
      'Content-Type': 'application/json'
    }
  }

  console.log('➡️  Response:', response)

  return response
}

async function getTaxRate() {
  for await (const rate of stripe.taxRates.list()) {
    if (rate['display_name'] === 'VAT' && rate['percentage'] === 20.0 && !rate['inclusive']) {
      return rate
    }
  }

  throw 'No VAT tax rate configured in Stripe'
}

exports.handler = Sentry.AWSLambda.wrapHandler(async (event, context, callback) => {
  if (event.httpMethod !== 'POST') {
    return respond(405, {error: 'Method Not Allowed'})
  }

  const {configuration: clientId, baseUrl} = JSON.parse(event.body)
  const errorMessageForUser = 'There was an unexpected error when attempting to start the subscription. Please try again later.'

  if (!clientId || !baseUrl) {
    console.error('💣 Client ID or base URL was not provided in request', event)

    return respond(400, {error: errorMessageForUser})
  }

  try {
    const taxRate = await getTaxRate()
    const sessionId = await createSession(clientId, baseUrl, taxRate.id)
    console.log('🔧 Created session ID', sessionId)

    return respond(200, {session_id: sessionId})
  } catch (err) {
    Sentry.captureException(err)
    console.error('💣 Stripe error:', err)
    console.log('🔎 Event:', event)

    let statusCode = 500
    if (err.statusCode) {
      statusCode = err.statusCode
    }

    const body = {
      error: errorMessageForUser
    }

    return respond(statusCode, body)
  }
})

async function getCustomer(email) {
  const customersWithEmail = []

  for await (const customer of stripe.customers.list({email})) {
    customersWithEmail.push(customer)
  }

  const numberCustomersWithEmail = customersWithEmail.length

  if (numberCustomersWithEmail === 0) {
    console.log(`🙅‍♀️ No existing customer found with email ${email}. A new one will be created during checkout.`)

    return null
  }

  const chosenMatchingCustomer = customersWithEmail[0]

  if (numberCustomersWithEmail > 1) {
    console.log(`👨‍👩‍👧‍👧 Found ${numberCustomersWithEmail} with email ${email} so defaulting to the first match (${chosenMatchingCustomer.id}).`)
  }

  return chosenMatchingCustomer
}

function generateMonthlyProductLineItems(products) {
  return products.filter(product => product._type === 'monthlyProduct')
    .map(product => {
      return {
        price: product.priceId,
        quantity: product.quantity
      }
    })
}

function generateOneOffLineItems(products) {
  return products.filter(product => product._type === 'oneOffProduct')
    .map(product => {
      const {name, amount} = product
      return {
        quantity: 1,
        price_data: {
          product_data: {
            name
          },
          currency: 'gbp',
          unit_amount: amount
        }
      }
    })
}

function calculateRemainingContractMonths(agreementEndDate) {
  const today = new moment().startOf('day')
  const agreementEnd = moment(agreementEndDate, 'YYYY-MM-DD')

  return Math.ceil(agreementEnd.diff(today, 'months', true))
}

function generateAccountsLineItems(products, agreementEndDate) {
  const lineItems = []

  products
    .filter(product => product._type === 'accountsProduct')
    .forEach((product) => {
      const {name, amount, priceId, quantity} = product
      let catchUpMonths = calculateNumberOfCatchUpMonths(product['yearEnd'])

      // Avoid having a catch-up fee with a single monthly payment before they're all paid up for the agreement
      if (catchUpMonths === 11) {
        catchUpMonths = 12
      }

      // Need to add future subscription items
      if (catchUpMonths < 12) {
        lineItems.push({
          price: priceId,
          quantity: quantity
        })
      }

      if (catchUpMonths === 0) {
        return
      }

      // Work-around because descriptions are not shown on checkout page for subscriptions
      const month = catchUpMonths === 1 ? 'month' : 'months'
      const totalCatchUpFee = amount * catchUpMonths

      const catchUpLineItem = {
        quantity: 1,
        price_data: {
          product_data: {
            name: `${name} (${catchUpMonths} ${month} alignment fee)`
          },
          currency: 'gbp',
          unit_amount: totalCatchUpFee
        }
      }

      let remainingContractMonths = calculateRemainingContractMonths(agreementEndDate)
      // Make sure we never calculate a negative number of catch-up months
      if (remainingContractMonths < 0) {
        remainingContractMonths = 1
      }
      const monthlyPayment = Math.ceil(totalCatchUpFee / remainingContractMonths)
      const alignmentFeeDescription = ` (${catchUpMonths} ${month} alignment fee paid over ${remainingContractMonths} month${remainingContractMonths > 1 ? 's' : ''})`
      let productName = `${name}${catchUpMonths < 12 ? alignmentFeeDescription : ''}`;
      catchUpLineItem['price_data'] = {
        product_data: {
          name: productName,
        },
        currency: 'gbp',
        unit_amount: monthlyPayment,
      }

      if (catchUpMonths < 12) {
        catchUpLineItem['recurring'] = {
          interval: 'month'
        }
      }

      lineItems.push(catchUpLineItem)
    })

  return lineItems
}

function determineMode(lineItems) {
  if (lineItems.filter(item => Object.hasOwn(item, 'price')).length > 0) {
    return 'subscription'
  }

  return 'payment'
}

function calculateTrialEnd(startDate) {
  const now = new moment()
  const agreementStartDate = moment(startDate, 'YYYY-MM-DD')

  if (agreementStartDate < now) {
    return null
  }

  // Stripe requires that trials end at least 2 days in the future.
  // End the trial in 2 days if the agreement starts before then.
  if (agreementStartDate.diff(now, 'days') < 2) {
    return now.add(48, 'hours').format('X')
  }

  return agreementStartDate.format('X')
}

async function getConfiguration(clientId) {
  const filter = `*[_type == "client" && !(_id in path("drafts.**")) && clientId == "${clientId}"][0] {
    name,
    email,
    subscription,
  }`

  return await client.fetch(filter).catch(err => console.error(err))
}

async function createDiscountCoupon(discountConfiguration) {
  if (!discountConfiguration) {
    return []
  }

  let params = {
    name: discountConfiguration.description,
    duration: "forever",
  }

  if (discountConfiguration.amount) {
    params = {
      ...params,
      amount_off: discountConfiguration.amount,
      currency: "GBP",
    }
  } else {
    params["percent_off"] = discountConfiguration.percentage
  }


  return [{
    coupon: (await stripe.coupons.create(params)).id,
  }]
}

async function createSession(clientId, baseUrl, taxRateId) {
  const configuration = await getConfiguration(clientId)
  const email = isProduction() ? configuration.email : generateDummyEmail(configuration.email)

  let payload = {
    success_url: `${baseUrl}?state=success`,
    cancel_url: `${baseUrl}?state=cancelled`,
    payment_method_types: ['card']
  }

  const customer = await getCustomer(email)

  if (customer) {
    payload['customer'] = customer.id
  } else {
    payload['customer_email'] = email
  }
  const subscriptionConfiguration = configuration.subscription

  let lineItems = [
    ...(generateMonthlyProductLineItems(subscriptionConfiguration.products)),
    ...(generateAccountsLineItems(subscriptionConfiguration.products, subscriptionConfiguration.agreement.end)),
    ...(generateOneOffLineItems(subscriptionConfiguration.products)),
  ]

  const paymentMode = determineMode(lineItems)
  payload['mode'] = paymentMode
  payload['line_items'] = lineItems

  payload['discounts'] = await createDiscountCoupon(subscriptionConfiguration.discount)

  if (paymentMode === 'subscription') {
    payload['payment_method_types'].push('bacs_debit')
    payload['subscription_data'] = {}
    payload['subscription_data']['default_tax_rates'] = [taxRateId]
    payload['subscription_data']['metadata'] = {
      client_id: clientId,
      client_name: configuration.name,
    }

    if ('agreement' in subscriptionConfiguration) {
      const trialEndDate = calculateTrialEnd(subscriptionConfiguration.agreement.start)
      if (trialEndDate) {
        payload['subscription_data']['trial_end'] = trialEndDate
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
    }

    // Tax information needs to be set per-item if no subscription is started with the checkout session.
    for (const lineItem of payload['line_items']) {
      lineItem.tax_rates = [taxRateId]
    }
  }

  console.log('📨', JSON.stringify(payload, null, 2))

  const response = await stripe.checkout.sessions.create(payload)

  return response.id
}

function calculateNumberOfCatchUpMonths(yearEnd) {
  const now = new moment().startOf('day')
  const yearEndDate = moment(yearEnd, 'YYYY-MM-DD')

  if (yearEndDate < now) {
    return 12
  }

  let months = 12 - Math.ceil(yearEndDate.diff(now, 'months', true))


  // Financial year hasn't started
  if (months < 0) {
    return 0
  }

  return months
}


// module.exports = {
//     calculateNumberOfCatchUpMonths
// }
