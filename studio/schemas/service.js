import {FontAwesomeSixIconInput} from '../components/FontAwesomeSixIcon'

async function requiredIfServiceIsIncludedOnServicesPage(field, context) {
  const includeOnServicesPage = context.document.includeOnServicesPage;

  if (field || !includeOnServicesPage) {
    return true;
  }

  return "This service is set to display on the services page so this field is required."
}

export default {
  name: 'service',
  type: 'document',
  title: 'Services',
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required(),
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
      ],
      validation: Rule => Rule.custom(requiredIfServiceIsIncludedOnServicesPage),
    },
    {
      name: 'content',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      validation: Rule => Rule.required(),
    },
    {
      name: 'icon',
      type: 'string',
      validation: Rule => Rule.custom(requiredIfServiceIsIncludedOnServicesPage),
      description: 'These are the old-style icons and are being replaced with version 6, below'
    },
    {
      name: 'fontAwesomeSixIcon',
      title: 'FontAwesome 6 icon',
      type: 'string',
      components: {
        input: FontAwesomeSixIconInput,
      },
      validation: Rule => Rule.custom(requiredIfServiceIsIncludedOnServicesPage),
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
      },
      validation: Rule => Rule.required(),
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
