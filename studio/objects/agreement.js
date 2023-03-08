export default {
  name: 'agreement',
  type: 'object',
  title: 'Agreement',
  fields: [
    {
      name: 'start',
      type: 'date',
      validation: Rule => Rule.required()
    },
    {
      name: 'end',
      type: 'date',
      validation: Rule => Rule.required().min(Rule.valueOfField('start'))
    }
  ]
}
