import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'client',
  title: 'Client',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Client Name',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(100),
    }),
  ],
})