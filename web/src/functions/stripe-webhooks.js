import Stripe from 'stripe';
import Sentry from '@sentry/serverless';
import readClient from '../../config/utils/sanityClient.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const writeClient = readClient.withConfig({
  token: process.env.SANITY_WRITE_TOKEN,
});

function isProduction() {
  return process.env.ENV === 'production';
}

let buildInformation = {};
try {
  buildInformation = require(`${__dirname}/build.json`);
} catch (e) {
  // File doesn't exist. Probably running locally.
}

function getCommitRef() {
  if ('commitRef' in buildInformation) {
    return buildInformation['commitRef'];
  }

  return 'unknown';
}

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

const respond = (statusCode, body = null) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export const handler = Sentry.AWSLambda.wrapHandler(async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method Not Allowed' });
  }

  let signature = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    if (!isProduction()) {
      console.warn(
        `⚠️ Generating test signature because we're in the ${process.env.ENV} environment.`
      );
      signature = stripe.webhooks.generateTestHeaderString({
        payload: event.body,
        secret: process.env.STRIPE_WEBHOOK_SIGNING_SECRET,
      });
    }

    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET
    );
    console.log('📝 Stripe event:', stripeEvent);
  } catch (err) {
    Sentry.captureException(err);
    console.error('💣 Stripe error:', err);
    return respond(400);
  }

  const eventTypesToProcess = {
    'checkout.session.completed': checkoutSessionCompleted,
    'checkout.session.expired': checkoutSessionExpired,
    'customer.subscription.created': customerSubscriptionCreated,
  };

  const eventType = stripeEvent['type'];

  if (!(eventType in eventTypesToProcess)) {
    console.log(`🤚 Event type ${eventType} is being ignored`);
    return respond(202);
  }

  try {
    console.log(`🖥 Processing ${eventType}`);
    return await eventTypesToProcess[eventType](stripeEvent);
  } catch (err) {
    Sentry.captureException(err);
    console.error('💣 Stripe error:', err);

    return respond(err.statusCode);
  }
});

async function getSanityDocumentIdForClientId(clientId) {
  const filter = `*[_type == "client" && clientId == "${clientId}"][0] {
        "id": _id
      }`;

  return await readClient.fetch(filter).catch(err => {
    console.error('💣 Sanity get client error:', err);
    Sentry.captureException(err);
  });
}

async function updateSanityClientDocument(id, customerId, subscriptionId) {
  const patch = {
    'subscription.customerId': customerId,
    'subscription.subscriptionId': subscriptionId,
  };

  const doc = await writeClient.patch(id).set(patch).commit();

  console.info(
    `✏️ Updated Sanity client document ${id} (rev ${doc._rev}) with ${JSON.stringify(patch)}`
  );
}

async function triggerNetlifyBuild() {
  await fetch(process.env.STRIPE_WEBHOOK_BUILD_HOOK, {
    method: 'POST',
  });
}

async function checkoutSessionCompleted(event) {
  async function updateSubscriptionPaymentMethod() {
    const intentId = event.data.object.setup_intent;

    if (!intentId) {
      return respond(202);
    }

    const setupIntent = await stripe.setupIntents.retrieve(intentId);
    const subscriptionId = setupIntent.metadata.subscription_id;
    const paymentMethod = setupIntent.payment_method;

    await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethod,
    });
  }

  await updateSubscriptionPaymentMethod();

  return respond(200);
}

async function customerSubscriptionCreated(event) {
  async function setCustomerAndSubscriptionIdsInSanity() {
    const object = event.data.object;
    const customerId = object.customer;
    const subscriptionId = object.id;
    const clientId = object.metadata.client_id;

    const document = await getSanityDocumentIdForClientId(clientId);

    // There should always be a matching client document but that will need to be manually
    // investigated if it's not the case
    if (!document) {
      console.error(`💣No Sanity client document found for ID ${clientId}`);
      return;
    }

    await updateSanityClientDocument(document.id, customerId, subscriptionId);
  }

  await setCustomerAndSubscriptionIdsInSanity();
  await triggerNetlifyBuild();

  return respond(200);
}

async function checkoutSessionExpired(event) {
  async function removeStripeIdsFromSanity() {
    const object = event.data.object;
    const clientId = object.metadata.client_id;

    const document = await getSanityDocumentIdForClientId(clientId);

    // There should always be a matching client document but that will need to be manually
    // investigated if it's not the case
    if (!document) {
      console.error(`💣No Sanity client document found for ID ${clientId}`);
      return;
    }

    await updateSanityClientDocument(document.id, null, null);
  }

  await removeStripeIdsFromSanity();
  await triggerNetlifyBuild();

  return respond(200);
}
