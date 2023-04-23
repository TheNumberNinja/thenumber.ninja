// Sets the subscription type for all clients as follows:
// - Any *with* with a subscription ID to stripe.
// - Any *without* set to invoice
// A manual check will be made for any set to invoice to ensure they are correctly set.
const sanityClient = require('./sanityClient')

const clientsWithSubscriptionId = {
  query: '*[_type == "client" && !(_id in path("drafts.**")) && subscription.type == null && subscription.subscriptionId != null]'
}

const clientsWithoutSubscriptionId = {
  query: '*[_type == "client" && !(_id in path("drafts.**")) && subscription.type == null && subscription.subscriptionId == null]'
}

sanityClient
  .patch(clientsWithSubscriptionId)
  .set({'subscription.type': 'stripe'})
  .commit()
  .then()

sanityClient
  .patch(clientsWithoutSubscriptionId)
  .set({'subscription.type': 'invoice'})
  .commit()
  .then()
