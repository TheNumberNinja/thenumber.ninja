const {createClient} = require('@sanity/client')

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-02-01',
  token: process.env.SANITY_READ_TOKEN,
})

module.exports = client
