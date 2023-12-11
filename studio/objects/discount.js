export default {
  name: 'discount',
  type: 'object',
  title: 'Discount',
  fields: [
    {
      name: 'amount',
      type: 'number',
      validation: Rule => Rule.integer().min(0),
    },
    {
      name: 'percentage',
      type: 'number',
      validation: Rule => Rule.integer().min(0).max(100),
    },
    {
      name: 'description',
      type: 'string',
      validation: Rule => Rule.required(),
    }
  ]
}
