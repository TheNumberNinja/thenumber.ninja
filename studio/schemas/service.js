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
      name: 'call',
      type: 'string',
      options: {
        list: [
          {
            title: 'Introductory call',
            value: 'bb50d345-c515-452b-aaba-81b1cb631d26'
          },
          {
            title: 'Power hour',
            value: '8ece32f5-84b4-494c-9e67-9748f5b4948e'
          },
          {
            title: 'Automation power hour',
            value: 'e342377e-0005-4633-8be7-d518565bbd1f'
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
