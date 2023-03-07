import {StripeLinkInput} from '../components/StripeLinkInput'

export default {
  name: 'subscription',
  type: 'object',
  title: 'Subscription',
  fields: [
    {
      name: 'agreement',
      type: 'agreement'
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
      title: 'Stripe customer ID'
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
      title: 'Stripe subscription ID'
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
