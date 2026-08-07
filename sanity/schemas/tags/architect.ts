import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'architect',
  title: 'Architect',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Architect Name',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(100),
    }),
  ],
})