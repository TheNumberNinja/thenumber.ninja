import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {table} from '@sanity/table'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {dashboardTool} from '@sanity/dashboard'
import {netlifyWidget} from 'sanity-plugin-dashboard-widget-netlify'
import {media} from 'sanity-plugin-media'

// Netlify deploy widget config. Set these in the build/deploy environment
// (studio/.env.local locally, or the Sanity deploy env). The repo is public, so
// the build hook stays out of source. The guard fails the build with a clear
// message if any are missing, and narrows the types so the widget never receives
// `undefined`.
// Netlify: Site settings > General > Site details (name + API ID),
// and Site settings > Build & deploy > Build hooks (build hook ID).
const netlifySiteName = process.env.SANITY_STUDIO_NETLIFY_SITE_NAME
const netlifyApiId = process.env.SANITY_STUDIO_NETLIFY_API_ID
const netlifyBuildHookId = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID

if (!netlifySiteName || !netlifyApiId || !netlifyBuildHookId) {
  throw new Error(
    'Missing Netlify deploy widget env vars. Set SANITY_STUDIO_NETLIFY_SITE_NAME, ' +
      'SANITY_STUDIO_NETLIFY_API_ID and SANITY_STUDIO_NETLIFY_BUILD_HOOK_ID.',
  )
}

export default defineConfig({
  name: 'default',
  title: 'thenumber.ninja',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID as string,
  dataset: process.env.SANITY_STUDIO_DATASET as string,

  plugins: [
    dashboardTool({
      widgets: [
        netlifyWidget({
          title: 'Netlify deploys',
          sites: [
            {
              title: 'thenumber.ninja',
              name: netlifySiteName,
              apiId: netlifyApiId,
              buildHookId: netlifyBuildHookId,
            },
          ],
        }),
      ],
    }),
    structureTool({
      structure: (S, context) => {
        return S.list()
          .title('Content')
          .items([...S.documentTypeListItems().reverse()])
          .items([
            ...S.documentTypeListItems(),
            // Minimum required configuration
            orderableDocumentListDeskItem({
              type: 'service',
              title: 'Services page order',
              filter: `"websiteServicesPage" in destinations`,
              S,
              context,
            }),
          ])
      },
    }),
    visionTool(),
    table(),
    media(),
  ],

  schema: {
    types: schemaTypes,
  },
})
