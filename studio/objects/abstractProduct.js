import startCase from 'lodash/startCase'
import upperFirst from 'lodash/upperFirst'

export default {
  type: 'object',
  fields: [
    {
      name: 'name',
      type: 'string'
    },
    {
      name: 'priceId',
      type: 'string'
    },
    {
      name: 'quantity',
      type: 'number',
      default: 1
    },
    {
      name: 'amount',
      type: 'number'
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
