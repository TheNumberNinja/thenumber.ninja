import client from '../../config/utils/sanityClient.js';

async function getGlossaryTerms() {
  const filter = `*[_type == "glossary-term" && !(_id in path("drafts.**"))]|order(term) {
    term,
    definition,
  }`;
  return await client.fetch(filter).catch(err => console.error(err));
}

export default getGlossaryTerms;
