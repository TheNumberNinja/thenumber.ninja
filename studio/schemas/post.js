export default {
  name: 'post',
  type: 'document',
  title: 'Blog posts',
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title'
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'date',
      type: 'date',
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
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption'
        },
        {
          name: 'attribution',
          type: 'array',
          of: [
            {
              type: 'block'
            }
          ]
        }
      ]
    },
    {
      name: 'summary',
      type: 'array',
      of: [
        {
          type: 'block'
        }
      ],
      validation: Rule => Rule.required(),
    },
    {
      name: 'content',
      type: 'array',
      of: [
        {
          type: 'block'
        },
        {
          type: 'table'
        },
        {
          type: 'image',
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption'
            }
          ],
          options: {
            hotspot: true
          },
        }
      ],
      validation: Rule => Rule.required(),
    },
    {
      name: 'categories',
      type: 'array',
      of: [
        {
          type: 'string'
        }
      ],
      options: {
        layout: 'grid',
        list: [
          {
            title: 'Bookkeeping',
            value: 'Bookkeeping'
          },
          {
            title: 'Invoicing',
            value: 'Invoicing'
          },
          {
            title: 'Legal',
            value: 'Legal'
          },
          {
            title: 'News',
            value: 'News'
          },
          {
            title: 'Outsourcing',
            value: 'Outsourcing'
          },
          {
            title: 'Payroll',
            value: 'Payroll'
          },
          {
            title: 'Planning',
            value: 'Planning'
          },
          {
            title: 'Self-Assessment',
            value: 'Self-Assessment'
          },
          {
            title: 'Self-Employed',
            value: 'Self-Employed'
          },
          {
            title: 'Tax',
            value: 'Tax'
          },
          {
            title: 'Tips',
            value: 'Tips'
          }
        ]
      },
      validation: Rule => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      media: 'image',
    },
    prepare(selection) {
      const {title, date, media} = selection
      const parsedDate = new Date(Date.parse(date))
      const dateOptions = {year: 'numeric', month: 'long', day: 'numeric'}
      return {
        title,
        subtitle: parsedDate.toLocaleDateString(undefined, dateOptions),
        media,
      }
    }
  },
  orderings: [
    {
      title: 'Date',
      name: 'date',
      by: [
        {
          field: 'date', direction: 'desc',
        }
      ]
    }
  ]
}
