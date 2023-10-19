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
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'description',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      validation: Rule => Rule.required(),
    },
    {
      name: 'call',
      type: 'string',
      options: {
        list: [
          {
            title: 'Catch-up call',
            value: '0d655c35-49b4-456c-af1d-acb06df48c14'
          },
          {
            title: 'Introductory call',
            value: 'bb50d345-c515-452b-aaba-81b1cb631d26'
          },
          {
            title: 'Extended catch-up call',
            value: '22f79915-2f0d-4934-a6fa-c1472f840285'
          },
          {
            title: 'Xero set-up and training',
            value: '5860248e-6ce0-4e1a-ab68-3e419e2d0a93'
          },
        ].sort((a, b) => a.title.localeCompare(b.title))
      },
      validation: Rule => Rule.required()
    }
  ]
}
