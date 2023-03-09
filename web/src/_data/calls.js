const client = require('../../config/utils/sanityClient.js')
const toHtml = require('@portabletext/to-html').toHTML

async function getCalls () {
  const filter = `*[_type == "call" && !(_id in path("drafts.**"))] {
    title,
		"slug": slug.current,
		description,
		calendly,
  }`
  return await client.fetch(filter).then(calls => {
    return calls.map(call => {
      call.description = toHtml(call.description)
      return call
    })
  }).catch(err => console.error(err));
}

module.exports = getCalls
