export default {
  name: 'service',
  type: 'document',
  title: 'Services',
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
      name: 'subheading',
      type: 'string'
    },
    {
      name: 'summary',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ]
    },
    {
      name: 'content',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ]
    },
    {
      name: 'icon',
      type: 'string'
    },
    {
      name: 'requiresAmlCheckForCall',
      type: 'boolean',
      title: 'Is an AML check required before the call?',
      initialValue: false
    },
    {
      name: 'calendly',
      type: 'string',
      options: {
        list: [
          {
            title: 'Introductory call',
            value: 'introductory-call'
          },
          {
            title: 'Power hour',
            value: 'power-hour'
          },
          {
            title: 'Automation power hour',
            value: 'automation-power-hour'
          }
        ]
      }
    },
    {
      name: 'includeOnServicesPage',
      type: 'boolean',
      title: 'Should this service be listed on the main services page?',
      initialValue: true
    },
    {
      name: 'orderRank',
      type: 'string',
      hidden: true
    }
  ]
}
