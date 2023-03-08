export default {
  name: 'client',
  type: 'document',
  title: 'Clients',
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'clientId',
      type: 'string',
      title: 'Client ID',
      validation: Rule => [
        Rule.custom(async (clientId, context) => {
          // Taken from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
          const clientName = context.document.name
          const msgUint8 = new TextEncoder().encode(clientName) // encode as (utf-8) Uint8Array
          const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8) // hash the message
          const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
          const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('') // convert bytes to hex string

          if (clientId === hashHex) {
            return true
          }

          return 'The client ID doesn\'t match the name. If this is not intentional it will need to be updated and any old references changed or redirected.'
        })
      ]
    },
    {
      name: 'email',
      type: 'string',
      title: 'E-mail',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'subscription',
      type: 'subscription'
    },
    {
      name: 'documents',
      type: 'array',
      of: [
        {
          type: 'file',
          fields: [
            {
              name: 'type',
              type: 'string',
              options: {
                list: [
                  {
                    title: 'Limited Company summary',
                    value: 'Limited Company summary'
                  },
                  {
                    title: 'Personal summary',
                    value: 'Personal summary'
                  },
                  {
                    title: 'VAT summary',
                    value: 'VAT summary'
                  }
                ]
              },
              validation: Rule => Rule.required()
            },
            {
              name: 'lastUpdated',
              type: 'date',
              validation: Rule => Rule.required()
            }
          ],
          preview: {
            select: {
              title: 'type',
              lastUpdated: 'lastUpdated'
            },
            prepare(selection) {
              const {title, lastUpdated} = selection
              console.log('date', lastUpdated)
              const parsedDate = new Date(Date.parse(lastUpdated))
              const dateOptions = {year: 'numeric', month: 'long', day: 'numeric'}
              return {
                title,
                subtitle: parsedDate.toLocaleDateString(undefined, dateOptions),
              }
            }
          }
        }
      ]
    }
  ]
}
