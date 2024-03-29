const sanity = require('@sanity/client')
require('dotenv').config({
  path: '../.env.local'
})

/**
 * Set manually. Find configuration in
 * studio/sanity.json or on manage.sanity.io
 */

const configuration = {
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  useCdn: false,
  apiVersion: '2023-02-01',
  token: process.env.SANITY_WRITE_TOKEN
}
const client = sanity.createClient(configuration)
module.exports = client
