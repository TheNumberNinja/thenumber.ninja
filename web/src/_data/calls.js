import client from '../../config/utils/sanityClient.js';
import { toHTML as toHtml } from '@portabletext/to-html';

async function getCalls() {
  const filter = `*[_type == "call" && !(_id in path("drafts.**"))] {
    title,
		"slug": slug.current,
		description,
		call,
  }`;
  return await client
    .fetch(filter)
    .then(calls => {
      return calls.map(call => {
        call.description = toHtml(call.description);
        return call;
      });
    })
    .catch(err => console.error(err));
}

export default getCalls;
