const client = require('../../config/utils/sanityClient.js')
const toHtml = require('@portabletext/to-html').toHTML
const imageUrlBuilder = require("@sanity/image-url");
const builder = imageUrlBuilder(client);

function headshotUrl(source) {
  return builder.image(source)
    .auto('format')
    .url()
}

async function getServices () {
  const filter = `*[_type == "service" && !(_id in path("drafts.**"))]|order(orderRank) {
    _id,
    title,
    "slug": slug.current,
    subheading,
    summary,
    content,
    icon,
    calendly,
    requiresAmlCheckForCall,
    includeOnServicesPage,
    "testimonials": *[_type=='testimonial' && references(^._id)]
  }`
  return await client.fetch(filter).then(services => {
    return services.map(service => {
      service.summary = toHtml(service.summary)
      service.content = toHtml(service.content)
      service.testimonials.map(testimonial => {
        testimonial.testimonial = toHtml(testimonial.testimonial)
        testimonial.image.url = headshotUrl(testimonial.image)
      })
      return service
    })
  }).catch(err => console.error(err));
}

module.exports = getServices
