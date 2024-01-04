import {FontAwesomeSixIconInput} from '../components/FontAwesomeSixIcon'

function requiredForWebsiteOwnPage(value, context) {
  if (typeof value !== "undefined") {
    return true
  }

  if (!websiteOwnPageDestinationSelected(context.document.destinations)) {
    return true
  }

  return "This field is required to allow a web page to be created."
}

function disallowedIfWebsiteOwnPageDestinationNotSelected(value, context) {
  if (typeof value === "undefined") {
    return true
  }

  if (websiteOwnPageDestinationSelected(context.document.destinations)) {
    return true
  }

  return "This field must be blank if a web page is not being created for this service."
}

function requiredForWebsiteServicesPage(value, context) {
  if (typeof value !== "undefined") {
    return true
  }

  if (!websiteServicesPageDestinationSelected(context.document.destinations)) {
    return true
  }

  return "This field is required for the service to be shown on the services page."
}

function disallowedIfWebsiteServicesPageNotSelected(value, context) {
  if (typeof value === "undefined") {
    return true
  }

  if (websiteServicesPageDestinationSelected(context.document.destinations)) {
    return true
  }

  return "This field must be blank the service is not being displayed on the services page."
}

function disallowedIfNoWebsiteDestinationSelected(value, context) {
  if (typeof value === "undefined") {
    return true
  }

  if (anyWebsiteDestinationSelected(context.document.destinations)) {
    return true
  }

  return "This field must be blank if the service will not have a web page and will not be shown in the services page."
}


function requiredForProposalAndMenus(value, context) {
  if (typeof value !== "undefined") {
    return true
  }

  if (!proposalOrMenuDestinationSelected(context.document.destinations)) {
    return true
  }

  return "This field is required for the service to be included in the proposal and menus."
}

function disallowedIfNoProposalOrMenuDestinationSelected(value, context) {
  if (typeof value === "undefined") {
    return true
  }

  if (proposalOrMenuDestinationSelected(context.document.destinations)) {
    return true
  }

  return "This field must be blank if the service is not included in a proposal or pricing menu."
}

function destinationSelected(chosenDestinations, wantedDestinations) {
  if (!chosenDestinations) {
    return false
  }

  return wantedDestinations.some(wanted => chosenDestinations.includes(wanted))
}

function websiteOwnPageDestinationSelected(chosenDestinations) {
  return destinationSelected(chosenDestinations, ['websiteOwnPage'])
}

function websiteServicesPageDestinationSelected(chosenDestinations) {
  return destinationSelected(chosenDestinations, ['websiteServicesPage'])
}

function anyWebsiteDestinationSelected(chosenDestinations) {
  return websiteOwnPageDestinationSelected(chosenDestinations) ||
      websiteServicesPageDestinationSelected(chosenDestinations)
}

function proposalOrMenuDestinationSelected(chosenDestinations) {
  return destinationSelected(chosenDestinations, [
    'proposal',
    'menuLimitedCompany',
    'menuSoleTrader',
    'menuSelfAssessment',
  ])
}

export default {
  name: 'service',
  type: 'document',
  title: 'Services',

  // Groups
  groups: [
    {
      name: 'website',
      title: 'Website',
      hidden: ({value}) => !anyWebsiteDestinationSelected(value.destinations),
    },
    {
      name: 'proposalAndMenus',
      title: 'Proposal and pricing menus',
      hidden: ({document}) => !proposalOrMenuDestinationSelected(document.destinations),
    },
  ],

  // Field sets
  fieldsets: [
    {
      name: 'website',
      title: 'Website',
      hidden: ({document}) => !anyWebsiteDestinationSelected(document.destinations),
      options: {
        collapsible: true,
      },
    },
    {
      name: 'proposalAndMenus',
      title: 'Proposal and pricing menus',
      hidden: ({document}) => !proposalOrMenuDestinationSelected(document.destinations),
      options: {
        collapsible: true,
      },
    },
  ],

  // Fields
  fields: [
    // Default
    {
      name: 'title',
      type: 'string',
      title: 'Default title',
      description: 'Can be overridden for specific destinations',
      validation: Rule => Rule.required(),
    },
    {
      name: 'destinations',
      type: 'array',
      description: 'Where should this service be shown?',
      of: [
        {
          type: 'string',
        },
      ],
      validation: Rule => Rule.required().error("At least one destination must be selected."),
      options: {
        list: [
          {title: 'Website: Own page', value: 'websiteOwnPage'},
          {title: 'Website: Services page', value: 'websiteServicesPage'},
          {title: 'Proposal', value: 'proposal'},
          {title: 'Menu: Limited Company', value: 'menuLimitedCompany'},
          {title: 'Menu: Sole Trader', value: 'menuSoleTrader'},
          {title: 'Menu: Self Assessment', value: 'menuSelfAssessment'},
        ]
      }
    },

    // Website
    {
      name: 'websiteTitle',
      type: 'string',
      title: 'Website title',
      description: "You can leave this blank if you're happy with the default title",
      group: 'website',
      fieldset: 'website',
      validation: Rule => Rule.custom(disallowedIfNoWebsiteDestinationSelected),
    },
    {
      name: 'slug',
      type: 'slug',
      options: {
        // Default to website title, if set, but fallback to main title
        source: (doc) => doc.websiteTitle || doc.title,
      },
      group: 'website',
      fieldset: 'website',
      validation: Rule => [
        Rule.custom(requiredForWebsiteOwnPage),
        Rule.custom(disallowedIfWebsiteOwnPageDestinationNotSelected),
      ]
    },
    {
      name: 'subheading',
      type: 'string',
      fieldset: 'website',
      group: 'website',
    },
    {
      name: 'summary',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      group: 'website',
      fieldset: 'website',
      validation: Rule => [
        Rule.custom(requiredForWebsiteServicesPage),
        Rule.custom(disallowedIfWebsiteServicesPageNotSelected),
      ],
    },
    {
      name: 'content',
      title: 'Web page content',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      group: 'website',
      fieldset: 'website',
      validation: Rule => [
        Rule.custom(requiredForWebsiteOwnPage),
        Rule.custom(disallowedIfWebsiteOwnPageDestinationNotSelected),
      ],
    },
    {
      name: 'icon',
      type: 'string',
      group: 'website',
      fieldset: 'website',
      components: {
        input: FontAwesomeSixIconInput,
      },
      validation: Rule => [
        Rule.custom(requiredForWebsiteServicesPage),
        Rule.custom(disallowedIfWebsiteServicesPageNotSelected),
      ],
    },
    {
      name: 'requiresAmlCheckForCall',
      type: 'boolean',
      title: 'Is an AML check required before the call?',
      group: 'website',
      fieldset: 'website',
      validation: Rule => [
        Rule.custom(requiredForWebsiteOwnPage),
        // I can't find a way to allow a boolean to be set to undefined so any existing value
        // will have to be left if it was ever set. It will be ignored based on the destinations,
        // so that's not a big issue.
      ],
    },
    {
      name: 'call',
      type: 'string',
      group: 'website',
      fieldset: 'website',
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
      validation: Rule => [
        Rule.custom(requiredForWebsiteOwnPage),
        Rule.custom(disallowedIfWebsiteOwnPageDestinationNotSelected),
      ],
    },
    {
      name: 'orderRank',
      type: 'string',
      group: 'website',
      fieldset: 'website',
      hidden: true
    },

    // Proposal and menus
    {
      name: 'proposalHeading',
      type: 'string',
      title: 'Heading',
      description: "You can leave this blank if you're happy with the default title",
      group: 'proposalAndMenus',
      fieldset: 'proposalAndMenus',
      validation: Rule => Rule.custom(disallowedIfNoProposalOrMenuDestinationSelected),
    },
    {
      name: 'proposalContent',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      group: 'proposalAndMenus',
      fieldset: 'proposalAndMenus',
      validation: Rule => [
        Rule.custom(requiredForProposalAndMenus),
        Rule.custom(disallowedIfNoProposalOrMenuDestinationSelected),
      ],
    },
  ]
}
