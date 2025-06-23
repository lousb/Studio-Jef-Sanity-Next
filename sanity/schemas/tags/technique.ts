import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'technique',
  title: 'Technique',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Technique Name',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(100),
    }),
  ],
})