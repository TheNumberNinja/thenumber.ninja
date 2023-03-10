const Sentry = require('@sentry/serverless')
const client = require('../../config/utils/sanityClient')

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

async function getDocument(documentKey, email) {
  const filter = `*[
    _type == "client" &&
    !(_id in path("drafts.**")) &&
    email == "${email.toLowerCase()}" &&
    "${documentKey}" in documents[]._key
  ][0] {
    "client": name,
    "type": documents[_key == "${documentKey}"][0].type,
    "url": documents[_key == "${documentKey}"][0].asset->url
}`

  return await client.fetch(filter).catch(err => console.error(err))
}

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

exports.handler = Sentry.AWSLambda.wrapHandler(async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return respond(405, {error: 'Method Not Allowed'})
  }

  const {email, documentKey} = JSON.parse(event.body)
  console.info(`✉️ ${email}`)
  console.info(`🗝️ ${documentKey}`)

  const document = await getDocument(documentKey, email)
  console.log('📄', document)

  if (!document) {
    return respond(400, {error: 'The email address you provided does not match the one we have on record. Please try again or email support@thenumberninja.co.uk if you need to update it.'})
  }

  const {client, type, url} = document
  const filename = `${type} for ${client}.pdf`.replaceAll(' ', '-')
  const pdfUrl = `${url}?dl=${filename}`
  const body = {
    url: pdfUrl
  }

  return respond(200, body)
})
