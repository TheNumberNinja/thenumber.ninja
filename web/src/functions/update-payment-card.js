const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Sentry = require("@sentry/serverless");

function isProduction() {
    return process.env.HUGO_ENV === "production";
}

let buildInformation = {}
try {
    buildInformation = require(`${__dirname}/build.json`)
} catch (e) {
    // File doesn't exist. Probably running locally.
}

function getCommitRef() {
    if ("commitRef" in buildInformation) {
        return buildInformation["commitRef"];
    }

    return "unknown";
}

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.HUGO_ENV,
    release: `the-number-ninja@${(getCommitRef())}`,
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
            'Content-Type': 'application/json'
        }
    }

    console.log(response)
    return response
}

exports.handler = Sentry.AWSLambda.wrapHandler(async function (event, context) {
    if (event.httpMethod !== "POST") {
        return respond(405, {error: 'Method Not Allowed'})
    }

    const {customerId, subscriptionId, baseUrl} = JSON.parse(event.body)

    if (!customerId || !subscriptionId || !baseUrl) {
        const message = 'Customer ID, subscription ID, or base URL was not provided in request'
        console.error(message, event)

        return respond(400, {error: message})
    }

    try {
        const sessionId = await createSession(customerId, subscriptionId, baseUrl)
        console.log('Created session ID', sessionId)

        return respond(200, {session_id: sessionId})
    } catch (err) {
        Sentry.captureException(err);
        console.error('Stripe error', err)
        console.log('Event', event)
        const body = {
            error: 'There was an unexpected error when attempting to update the payment card. Please try again later.'
        }
        return respond(err.statusCode, body)
    }
});

async function createSession(customerId, subscriptionId, baseUrl) {
    let payload = {
        success_url: `${baseUrl}?state=update-success`,
        cancel_url: `${baseUrl}?state=update-cancelled`,
        payment_method_types: ['card'],
        mode: 'setup',
        customer: customerId,
        setup_intent_data: {
            metadata: {
                subscription_id: subscriptionId,
            },
        },
    }

    const response = await stripe.checkout.sessions.create(payload)

    return response.id
}
