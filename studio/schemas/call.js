export default {
  name: 'call',
  type: 'document',
  title: 'Calls',
  fields: [
    {
      name: 'title',
      type: 'string'
    },
    {
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title'
      }
    },
    {
      name: 'description',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ]
    },
    {
      name: 'calendly',
      type: 'string',
      options: {
        list: [
          {
            title: 'Catch-up call',
            value: 'catch-up-call'
          },
          {
            title: 'Introductory call',
            value: 'introductory-call'
          },
          {
            title: 'Management accounts catch-up call',
            value: 'management-accounts-catch-up'
          },
          {
            title: 'Extended catch-up call',
            value: 'extended-catch-up-call'
          },
          {
            title: 'Xero set-up and training',
            value: 'xero-setup-and-training'
          },
        ].sort((a, b) => a.title.localeCompare(b.title))
      }
    }
  ]
}
