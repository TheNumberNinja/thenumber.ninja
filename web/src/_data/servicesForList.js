const client = require('../../config/utils/sanityClient.js')
const toHtml = require('@portabletext/to-html').toHTML
const imageUrlBuilder = require("@sanity/image-url");
const builder = imageUrlBuilder(client);

function headshotUrl(source) {
  return builder.image(source)
    .auto('format')
    .url()
}

async function getServices() {
  const filter = `*[_type == "service" && "websiteServicesPage" in destinations && !(_id in path("drafts.**"))]|order(orderRank) {
    _id,
    title,
    "slug": slug.current,
    summary,
    icon
  }`
  return await client.fetch(filter).then(services => {
    return services.map(service => {
      service.summary = toHtml(service.summary)

      return service
    })
  }).catch(err => console.error(err));
}

module.exports = getServices
