import Stripe from 'stripe';
import Sentry from '@sentry/serverless';
import { getCommitRef, isProduction } from '../../config/functions/index.js';

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
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  console.log(response);
  return response;
};

export const handler = Sentry.AWSLambda.wrapHandler(async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method Not Allowed' });
  }

  const { customerId, subscriptionId, baseUrl } = JSON.parse(event.body);

  if (!customerId || !subscriptionId || !baseUrl) {
    const message = 'Customer ID, subscription ID, or base URL was not provided in request';
    console.error(message, event);

    return respond(400, { error: message });
  }

  try {
    const session = await createSession(customerId, subscriptionId, baseUrl);
    console.log('Created session', session.id);

    return respond(200, { session_url: session.url });
  } catch (err) {
    Sentry.captureException(err);
    console.error('Stripe error', err);
    console.log('Event', event);
    const body = {
      error:
        'There was an unexpected error when attempting to update the payment card. Please try again later.',
    };
    return respond(err.statusCode, body);
  }
});

async function createSession(customerId, subscriptionId, baseUrl) {
  const payload = {
    success_url: `${baseUrl}?state=update-success`,
    cancel_url: `${baseUrl}?state=update-cancelled`,
    payment_method_types: ['card', 'bacs_debit'],
    mode: 'setup',
    customer: customerId,
    setup_intent_data: {
      metadata: {
        subscription_id: subscriptionId,
      },
    },
  };

  const session = await stripe.checkout.sessions.create(payload);

  return { id: session.id, url: session.url };
}
