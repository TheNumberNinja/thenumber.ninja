import startCase from 'lodash/startCase'
import upperFirst from 'lodash/upperFirst'

export default {
  type: 'object',
  fields: [
    {
      name: 'name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'priceId',
      type: 'string',
      title: 'Price ID',
      validation: Rule => Rule.regex(/^(plan_|price_).+/).error('Price ID must start with "plan_" or "price_"'),
    },
    {
      name: 'quantity',
      type: 'number',
      default: 1,
      validation: Rule => Rule.required().integer(),
    },
    {
      name: 'amount',
      type: 'number',
      description: 'Product price in pence, for a single unit (NOT a total for this line)',
      validation: Rule => Rule.required().integer(),
    }
  ],
  preview: {
    select: {
      title: 'name',
      type: '_type'
    },
    prepare(selection) {
      const {title, type} = selection
      return {
        title,
        subtitle: upperFirst(startCase(type).toLowerCase()),
      }
    }
  }
}
