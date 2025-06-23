import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'genre',
  title: 'Genre',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Genre Name',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(100),
    }),
  ],
})