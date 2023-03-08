export default {
  name: 'discount',
  type: 'object',
  title: 'Discount',
  fields: [
    {
      name: 'amount',
      type: 'number',
      validation: Rule => Rule.required().integer(),
    },
    {
      name: 'coupon',
      type: 'string',
      validation: Rule => Rule.required(),
    }
  ]
}
