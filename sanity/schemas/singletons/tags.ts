import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'tags',
  title: 'Tags',
  type: 'document',
  fields: [
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'array',
      of: [
        defineField({
          name: 'item',
          title: 'Genre Item',
          type: 'string',
        }),
      ],
      description: 'Add or select genres.',
    }),
    defineField({
      name: 'technique',
      title: 'Technique',
      type: 'array',
      of: [
        defineField({
          name: 'item',
          title: 'Technique Item',
          type: 'string',
        }),
      ],
      description: 'Add or select techniques.',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'array',
      of: [
        defineField({
          name: 'item',
          title: 'Client Item',
          type: 'string',
        }),
      ],
      description: 'Add or select clients.',
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [
        defineField({
          name: 'item',
          title: 'Credits Item',
          type: 'string',
        }),
      ],
      description: 'Add or select credits.',
    }),
  ],
})