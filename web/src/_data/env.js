require('dotenv').config()

module.exports = {
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  }
}
