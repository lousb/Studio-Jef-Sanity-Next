import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'credits',
  title: 'Credits',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Credits Name',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(100),
    }),
  ],
})