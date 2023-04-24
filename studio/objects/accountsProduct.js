import abstractProduct from './abstractProduct'

export default {
  ...abstractProduct,
  name: 'accountsProduct',
  title: 'Accounts product',
  initialValue: {
    catchUpMethod: 'upfront',
  },
  fields: [
    ...abstractProduct['fields'],
    {
      name: 'yearEnd',
      type: 'date',
      validation: Rule => Rule.required(),
    },
    {
      name: 'catchUpMethod',
      type: 'string',
      options: {
        list: [
          {
            title: 'Upfront',
            value: 'upfront'
          },
          {
            title: 'Monthly instalments',
            value: 'monthlyInstalments'
          },
        ]
      },
      validation: Rule => Rule.warning(),
    }
  ]
}
