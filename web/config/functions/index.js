const crypto = require('crypto')

function isProduction() {
  return process.env.ENV === 'production'
}

function generateDummyEmail(email) {
  const hasher = crypto.createHmac('md5', '0041015581')
  const prefix = hasher.update(email).digest('hex')
  return `${prefix}@thenumber.ninja`
}

function getCommitRef() {
  try {
    const buildInformation = require(`${__dirname}/build.json`)
    if ('commitRef' in buildInformation) {
      return buildInformation['commitRef']
    }
  } catch (e) {
    // File doesn't exist. Probably running locally.
  }

  console.warn('No commit reference found for this function. This is fine if we are running the code locally.')
  return 'unknown'
}

module.exports = {
  generateDummyEmail,
  getCommitRef,
  isProduction
}
