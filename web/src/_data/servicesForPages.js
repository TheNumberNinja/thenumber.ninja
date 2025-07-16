import client from '../../config/utils/sanityClient.js';
import { toHTML as toHtml } from '@portabletext/to-html';
import imageUrlBuilder from '@sanity/image-url';
const builder = imageUrlBuilder(client);

function headshotUrl(source) {
  return builder.image(source).auto('format').url();
}

async function getServices() {
  const filter = `*[_type == "service" && "websiteOwnPage" in destinations && !(_id in path("drafts.**"))]|order(orderRank) {
    _id,
    title,
    "slug": slug.current,
    subheading,
    content,
    call,
    requiresAmlCheckForCall,
    "testimonials": *[_type=='testimonial' && references(^._id)]
  }`;
  return await client
    .fetch(filter)
    .then(services => {
      return services.map(service => {
        service.content = toHtml(service.content);
        service.testimonials.map(testimonial => {
          testimonial.testimonial = toHtml(testimonial.testimonial);
          testimonial.image.url = headshotUrl(testimonial.image);
        });

        return service;
      });
    })
    .catch(err => console.error(err));
}

export default getServices;
