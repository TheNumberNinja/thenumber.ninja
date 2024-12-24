import {defineConfig} from 'sanity'
import {structureTool} from "sanity/structure";
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {table} from '@sanity/table'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import { netlifyTool } from 'sanity-plugin-netlify'
import {media} from 'sanity-plugin-media'

export default defineConfig({
  name: 'default',
  title: 'thenumber.ninja',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID as string,
  dataset: process.env.SANITY_STUDIO_DATASET as string,

  plugins: [
    netlifyTool(),
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
              context
            })
          ])
      }
    }),
    visionTool(),
    table(),
    media()
  ],

  schema: {
    types: schemaTypes
  }
})
