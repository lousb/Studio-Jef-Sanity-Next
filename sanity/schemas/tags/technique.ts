import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'technique',
  title: 'Technique',
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