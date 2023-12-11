import abstractProduct from './abstractProduct'

export default {
  ...abstractProduct,
  name: 'accountsProduct',
  title: 'Accounts product',
  fields: [
    ...abstractProduct['fields'],
    {
      name: 'yearEnd',
      type: 'date',
      validation: Rule => Rule.required(),
    },
  ]
}
