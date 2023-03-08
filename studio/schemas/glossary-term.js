export default {
  name: 'glossary-term',
  type: 'document',
  title: 'Glossary',
  fields: [
    {
      name: 'term',
      type: 'string',
      validation: Rule => Rule.required(),

    },
    {
      name: 'definition',
      type: 'string',
      validation: Rule => Rule.required(),
    }
  ]
}
