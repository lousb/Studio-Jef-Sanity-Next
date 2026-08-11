import { ImageIcon, PlayIcon, StarIcon, TextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Projects',
  type: 'document',
  icon: StarIcon,
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    defineField({
      name: 'customIndex',
      description: 'A custom numerical index.',
      title: 'Custom Index',
      type: 'number',
    }),
    defineField({
      name: 'title',
      description: 'This field is the title of your project.',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      description: 'This field is the project page name at yourwebsite.com/projects/<name>.',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    
    defineField({
  name: 'coverImage',
  title: 'Cover Image',
  description: 'This image will be used as the cover for the project.',
  type: 'image',
  options: { hotspot: true },
  validation: (rule) => rule.required(),
}),
    defineField({
      name: 'overview',
      description:
        'Used both for project subheader, and the <meta> description tag for SEO.',
      title: 'Overview',
      type: 'array',
      of: [
        // Paragraphs
        defineArrayMember({
          lists: [],
          marks: {
            annotations: [],
            decorators: [
              {
                title: 'Italic',
                value: 'em',
              },
              {
                title: 'Strong',
                value: 'strong',
              },
            ],
          },
          styles: [],
          type: 'block',
        }),
      ],
      validation: (rule) => rule.max(155).required(),
    }),
    defineField({
      name: 'year',
      description: 
        '(Optional) This freeform field is for year or type of your project. It will be displayed next to title in the projects list within the homepage and below title at project page.',
      title: 'Year',
      type: 'string',
    }),
    defineField({
  name: 'status',
  title: 'Status',
  type: 'string',
  options: {
    list: [
      { title: 'Completed', value: 'completed' },
      { title: 'In Progress', value: 'in-progress' },
      { title: 'Concept', value: 'concept' },
    ],
    layout: 'radio',
  },
}),
defineField({
  name: 'size',
  title: 'Size',
  description: 'e.g. 90m²',
  type: 'string',
}),
defineField({
  name: 'location',
  title: 'Location',
  description: 'e.g. Bondi Junction, Sydney',
  type: 'string',
}),
defineField({
  name: 'projectType',
  title: 'Project Type',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'projectType' }] }],
  description: 'Pick from existing project types or add a new one.',
}),
defineField({
  name: 'architects',
  title: 'Architect(s)',
  type: 'array',
  of: [{ type: 'reference', to: [{ type: 'architect' }] }],
  description: 'Pick from existing architects or add a new one.',
}),
    defineField({
      name: 'site',
      title: 'Website link',
      description: '(Optional) External link related to your project, it is displayed below your project overview text.',
      type: 'object',
      options: {
        columns: 2,
      },
      fields: [
        {
          title: 'URL Title',
          name: 'urltitle',
          type: 'string',
        },
        {
          title: 'URL link',
          name: 'url',
          type: 'url',
        },
      ],
    }),



     

    // Content blocks
    defineField({
      title: 'Content builder',
      description: 'This is a content builder for your project page, choose content type and add your content. You can rearrange your blocks later.',
      name: 'content',
      type: 'array',
      of: [
        // Text block 
        defineArrayMember({
          title: 'Text Block',
          name: 'textBlock',
          type: 'object',
          icon: TextIcon,
          fields: [
            {
              name: 'description',
              title: 'Text Block',
              type: 'array',
              of: [
                defineArrayMember({
                  lists: [],
                  marks: {
                    annotations: [
                      {
                        name: 'link',
                        type: 'object',
                        title: 'Link',
                        fields: [
                          {
                            name: 'href',
                            type: 'url',
                            title: 'Url',
                          },
                        ],
                      },
                    ],
                    decorators: [
                      {
                        title: 'Italic',
                        value: 'em',
                      },
                      {
                        title: 'Strong',
                        value: 'strong',
                      },
                    ],
                  },
                  styles: [],
                  type: 'block',
                }),
              ],
            },
          ],
          preview: {
            select: {
              content: 'description'
            },
            prepare({ content }) {
              return {
                title: 'Text Block',
                // subtitle: content
              }
            },
          },
        }),

       

        defineArrayMember({
  name: 'hybridMedia',
  title: 'Media',
  type: 'object',
  icon: ImageIcon,
  fields: [
    {
      title: 'Image',
      name: 'media',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
    },
    {
      title: 'Caption',
      name: 'caption',
      type: 'string',
      description: '(Optional) Caption below the media.',
    },
    {
      title: 'Featured',
      name: 'featured',
      type: 'boolean',
      description: 'Mark this media as featured. This will display on the home page',
    },
    {
      title: 'Width',
      name: 'width',
      type: 'string',
      options: {
        list: [
          { title: '8 Columns', value: '8col' },
          { title: '16 Columns', value: '16col' },
          { title: '24 Columns (Full Width)', value: '24col' },
        ],
        layout: 'radio',
      },
      initialValue: 'fullwidth',
    },
  ],
  preview: {
    select: {
      media: 'media',
      caption: 'caption',
      featured: 'featured',
    },
    prepare({ media, caption, featured }) {
      return {
        title: featured ? `Featured: ${caption || 'Untitled'}` : caption || 'Untitled',
        media,
      }
    },
  },
}),
        





        
        
        
        

               
      ],
    }),
  ],
})
