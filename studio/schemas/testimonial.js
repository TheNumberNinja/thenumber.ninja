export default {
  name: 'testimonial',
  type: 'document',
  title: 'Testimonials',
  fields: [
    {
      name: 'person_name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'person_description',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'testimonial',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      validation: Rule => Rule.required(),
    },
    {
      name: 'image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt text'
        }
      ]
    },
    {
      name: 'services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [
            {
              type: 'service'
            }
          ],
          options: {
            disableNew: true
          }
        }
      ],
      validation: Rule => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'person_name',
      services: 'services',
      media: 'image'
    },
    prepare(selection) {
      const {title, services, media} = selection
      return {
        title,
        // subtitle: services?.map(
        //   (key) => key.split('-').map(
        //     (word) => word.charAt(0).toUpperCase() + word.slice(1)
        //   ).join(' ')
        // ).join(', '),
        media
      }
    }
  }
}
