import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'projectType',
  title: 'Project Type',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Type Name',
      type: 'string',
      validation: (rule) => rule.required().min(1).max(100),
    }),
  ],
})