export default {
  name: 'client',
  type: 'document',
  title: 'Clients',
  fields: [
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'clientId',
      type: 'string',
      title: 'Client ID'
    },
    {
      name: 'email',
      type: 'string',
      title: 'E-mail'
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
                    value: 'Limited Company summary'
                  },
                  {
                    title: 'Personal summary',
                    value: 'Personal summary'
                  },
                  {
                    title: 'VAT summary',
                    value: 'VAT summary'
                  },
                ]
              },
              validation: Rule => Rule.required(),
            },
            {
              name: 'lastUpdated',
              type: 'date',
              validation: Rule => Rule.required(),
            }
          ]
        }
      ]
    }
  ]
}
