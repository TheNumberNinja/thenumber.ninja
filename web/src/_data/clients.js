const client = require('../../config/utils/sanityClient.js')

function maskEmailAddress(email) {
  if (!email) {
    return null;
  }

  email = email.toLowerCase()

  let [username, domain] = email.split('@')
  const domainParts = domain.split('.')
  let firstDomainPart = domainParts[0]

  if (username.length > 2) {
    username = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
  }

  if (firstDomainPart.length > 2) {
    firstDomainPart = firstDomainPart[0] + '*'.repeat(firstDomainPart.length - 2) + firstDomainPart[firstDomainPart.length - 1]

    domainParts[0] = firstDomainPart
    domain = domainParts.join('.')
  }

  return username + '@' + domain;
}

async function getClients() {
  const filter = `*[_type == "client" && !(_id in path("drafts.**"))] {
    name,
    clientId,
    "unmaskedEmailDoNotUse": email,
    subscription,
    documents[] {
      "key": _key,
      type,
      lastUpdated,
    }
  }`
  return await client.fetch(filter).then((clients) => {
    return clients.map(client => {
      client.maskedEmail = maskEmailAddress(client.unmaskedEmailDoNotUse)
      delete client.unmaskedEmailDoNotUse;
      return client
    })
  }).catch(err => console.error(err))
}

module.exports = getClients
