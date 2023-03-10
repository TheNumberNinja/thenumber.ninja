import {StripeLinkInput} from '../components/StripeLinkInput'

export default {
  name: 'subscription',
  type: 'object',
  title: 'Subscription',
  fields: [
    {
      name: 'type',
      type: 'string',
      options: {
        list: [
          {
            title: 'Stripe',
            value: 'stripe'
          },
          {
            title: 'Invoice',
            value: 'invoice'
          },
        ]
      },
      default: 'stripe',
      validation: Rule => Rule.required(),
    },
    {
      name: 'agreement',
      type: 'agreement',
    },
    {
      name: 'customerId',
      type: 'string',
      components: {
        input: StripeLinkInput,
      },
      options: {
        baseUrl: 'https://dashboard.stripe.com/customers/',
        objectType: 'customer',
      },
      title: 'Stripe customer ID',
      validation: Rule => Rule.regex(/^cus_.+/).error('Customer ID must start with "cus_"'),
    },
    {
      name: 'subscriptionId',
      type: 'string',
      components: {
        input: StripeLinkInput,
      },
      options: {
        baseUrl: 'https://dashboard.stripe.com/subscriptions/',
        objectType: 'subscription',
      },
      title: 'Stripe subscription ID',
      validation: Rule => Rule.regex(/^sub_.+/).error('Subscription ID must start with "sub_"'),
    },
    {
      name: 'products',
      type: 'array',
      of: [
        {
          type: 'oneOffProduct'
        },
        {
          type: 'monthlyProduct'
        },
        {
          type: 'accountsProduct'
        },
      ]
    },
    {
      name: 'discount',
      type: 'discount'
    }
  ]
}
