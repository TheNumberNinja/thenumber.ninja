const crypto = require('crypto')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const moment = require('moment')
const Sentry = require('@sentry/serverless')
const client = require('../../config/utils/sanityClient')

const hasher = crypto.createHmac('md5', '0041015581')

function isProduction() {
  return process.env.HUGO_ENV === 'production'
}

let buildInformation = {}
try {
  buildInformation = require(`${__dirname}/build.json`)
} catch (e) {
  // File doesn't exist. Probably running locally.
}

function getCommitRef() {
  if ('commitRef' in buildInformation) {
    return buildInformation['commitRef']
  }

  return 'unknown'
}

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.HUGO_ENV,
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

function generateAccountsLineItems(products) {
  return products.filter(product => product._type === 'accountsProduct')
    .map((product) => {
      const {name, amount, priceId, quantity} = product
      const catchUpMonths = calculateNumberOfCatchUpMonths(product['yearEnd'])

      // Need to add future subscription items
      if (catchUpMonths < 12) {
        return {
          price: priceId,
          quantity: quantity
        }
      }

      // Work-around because descriptions are not shown on checkout page for subscriptions
      const month = catchUpMonths === 1 ? 'month' : 'months'

      return {
        quantity: 1,
        price_data: {
          product_data: {
            name: `${name} (${catchUpMonths} ${month} catch-up)`
          },
          currency: 'gbp',
          unit_amount: amount * catchUpMonths
        }
      }
    })
}

function determineMode(recurringLineItems) {
  if (recurringLineItems.filter(item => Object.hasOwn(item, 'price')).length > 0) {
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

function generateDummyEmail(email) {
  return `${hasher.update(email).digest('hex')}@example.com`
}

async function getConfiguration(clientId) {
  const filter = `*[_type == "client" && !(_id in path("drafts.**")) && clientId == "${clientId}"][0] {
    email,
    subscription,
  }`

  return await client.fetch(filter).catch(err => console.error(err))
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
    ...(generateAccountsLineItems(subscriptionConfiguration.products)),
    ...(generateOneOffLineItems(subscriptionConfiguration.products)),
  ]

  const paymentMode = determineMode(lineItems)
  payload['mode'] = paymentMode
  payload['line_items'] = lineItems

  if ('discount' in subscriptionConfiguration && subscriptionConfiguration['discount']) {
    payload['discounts'] = [
      {
        'coupon': subscriptionConfiguration['discount']['coupon']
      }
    ]
  }

  if (paymentMode === 'subscription') {
    payload['payment_method_types'].push('bacs_debit')
    payload['subscription_data'] = {}
    payload['subscription_data']['default_tax_rates'] = [taxRateId]
    payload['subscription_data']['metadata'] = {
      client_id: clientId
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
        client_id: clientId
      }
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

  // Don't charge for more than a year's worth of fees if the year-end was more than 12 months ago
  months = Math.min(months, 12)

  // Round up to 12 months if we've already got to 11 to save having to tweak the subscription straight away
  if (months >= 11) {
    return 12
  }

  // Financial year hasn't started
  if (months < 0) {
    return 0
  }

  return months
}


// module.exports = {
//     calculateNumberOfCatchUpMonths
// }
