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
} catch {
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
  beforeSend(event, _hint) {
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

export const handler = Sentry.AWSLambda.wrapHandler(async function (event, _context) {
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
    'customer.subscription.deleted': customerSubscriptionDeleted,
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

    return respond(err.statusCode ?? 500);
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

async function getMatchingPublishedClientDocsForSubscriptionId(subscriptionId) {
  const filter = `*[
    _type == "client" &&
    !(_id in path("drafts.**")) &&
    subscription.subscriptionId == $subscriptionId
  ] { "id": _id }`;

  return await readClient.fetch(filter, { subscriptionId }).catch(err => {
    Sentry.captureException(err);
    console.error('💣 Sanity get client by subscriptionId error:', err);
    return [];
  });
}

async function getMatchingPublishedClientDocByCustomerId(customerId) {
  const filter = `*[
    _type == "client" &&
    !(_id in path("drafts.**")) &&
    subscription.customerId == $customerId
  ][0] { "id": _id }`;

  return await readClient.fetch(filter, { customerId }).catch(err => {
    Sentry.captureException(err);
    console.error('💣 Sanity get client by customerId error:', err);
    return null;
  });
}

async function clearSanitySubscriptionDetails(id) {
  const paths = [
    'subscription.type',
    'subscription.subscriptionId',
    'subscription.agreement',
    'subscription.proposalId',
    'subscription.proposalNumber',
    'subscription.products',
    'subscription.discount',
  ];

  const doc = await writeClient.patch(id).unset(paths).commit();

  console.info(
    `✏️ Cleared Sanity client document ${id} (rev ${doc._rev}); unset paths: ${JSON.stringify(paths)}`
  );
}

async function customerSubscriptionDeleted(event) {
  const subscriptionId = event.data.object.id;
  const customerId = event.data.object.customer;
  const matches = await getMatchingPublishedClientDocsForSubscriptionId(subscriptionId);

  if (matches.length === 0) {
    // subscriptionId not found — may be a retry after a partial failure where unset
    // succeeded but the build hook failed. The customerId is preserved in Sanity even
    // after the subscription is cleared, so look up by it and trigger the build.
    if (customerId) {
      const doc = await getMatchingPublishedClientDocByCustomerId(customerId);
      if (doc) {
        console.log(`🔄 Retry recovery: subscriptionId ${subscriptionId} already cleared; triggering build for doc ${doc.id} via customerId ${customerId}`);
        await triggerNetlifyBuild();
        return respond(200);
      }
    }
    const msg = `💣 No published Sanity client document found for subscription ID ${subscriptionId} (customerId: ${customerId})`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return respond(200);
  }

  if (matches.length > 1) {
    const ids = matches.map(m => m.id);
    const msg = `💣 Ambiguous match: ${matches.length} published Sanity client documents share subscription ID ${subscriptionId}: ${JSON.stringify(ids)}. Not mutating any — manual cleanup required.`;
    console.error(msg);
    Sentry.captureException(new Error(msg));
    return respond(200);
  }

  await clearSanitySubscriptionDetails(matches[0].id);
  await triggerNetlifyBuild();

  return respond(200);
}
