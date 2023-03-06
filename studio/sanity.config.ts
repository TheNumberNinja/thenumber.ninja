import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {table} from '@sanity/table'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export default defineConfig({
  name: 'default',
  title: 'thenumber.ninja',

  projectId: 'g94bd5vf',
  dataset: 'production',

  plugins: [
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
              title: 'Services',
              S,
              context
            }),
          //
          //   // Optional configuration
          //   orderableDocumentListDeskItem({
          //     type: 'service',
          //     title: 'Services',
          //     // icon: Paint,
          //     // Required if using multiple lists of the same 'type'
          //     // id: 'orderable-en-projects',
          //     // See notes on adding a `filter` below
          //     // filter: `__i18n_lang == $lang`,
          //     // params: {
          //     //   lang: 'en_US'
          //     // },
          //     // pass from the structure callback params above
          //     S,
          //     context
          //   }),
          ])
      }
    }),
    visionTool(),
    table()
  ],

  schema: {
    types: schemaTypes
  }
})
