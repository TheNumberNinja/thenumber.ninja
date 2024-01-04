import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {table} from '@sanity/table'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import { dashboardTool } from "@sanity/dashboard";
import { netlifyWidget } from "sanity-plugin-dashboard-widget-netlify";

export default defineConfig({
  name: 'default',
  title: 'thenumber.ninja',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID as string,
  dataset: process.env.SANITY_STUDIO_DATASET as string,

  plugins: [
    dashboardTool({
      widgets: [
        netlifyWidget({
          title: 'Netlify',
          sites: [
            {
              title: 'thenumber.ninja',
              apiId: process.env.SANITY_STUDIO_NETLIFY_SITE_API_ID as string,
              buildHookId: process.env.SANITY_STUDIO_NETLIFY_SITE_BUILD_HOOK_ID as string,
              name: 'thenumberninja',
            }
          ]
        })
      ]
    }),
    deskTool({
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
              context
            }),
          ])
      }
    }),
    visionTool(),
    table(),
  ],

  schema: {
    types: schemaTypes
  }
})
