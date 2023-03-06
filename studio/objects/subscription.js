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
      title: 'Stripe customer ID'
    },
    {
      name: 'subscriptionId',
      type: 'string',
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
