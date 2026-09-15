import {ClientIdInput, clientIdForName} from '../components/ClientIdInput'

async function clientIdMatchesName(clientId, context) {
  if (clientId === (await clientIdForName(context.document.name))) {
    return true
  }

  return "The client ID doesn't match the name. If this is not intentional it will need to be updated and any old references changed or redirected."
}

export default {
  name: 'client',
  type: 'document',
  title: 'Clients',
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'clientId',
      type: 'string',
      title: 'Client ID',
      components: {
        input: ClientIdInput,
      },
      validation: (Rule) => Rule.custom(clientIdMatchesName).warning(),
    },
    {
      name: 'email',
      type: 'string',
      title: 'E-mail',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'subscription',
      type: 'subscription',
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
                    value: 'Limited Company summary',
                  },
                  {
                    title: 'Personal summary',
                    value: 'Personal summary',
                  },
                  {
                    title: 'VAT summary',
                    value: 'VAT summary',
                  },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'lastUpdated',
              type: 'date',
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: 'type',
              lastUpdated: 'lastUpdated',
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
            },
          },
        },
      ],
    },
  ],
}
