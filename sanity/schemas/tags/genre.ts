import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'genre',
  title: 'Genre',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
})