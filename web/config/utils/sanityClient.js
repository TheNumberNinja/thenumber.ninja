const sanityClient = require('@sanity/client')

/**
 * Set manually. Find configuration in
 * studio/sanity.json or on manage.sanity.io
 */

const sanity = {
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-02-01'
}

module.exports = sanityClient({...sanity, token: process.env.SANITY_READ_TOKEN})
