import { CogIcon, LinkIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    defineField({
      name: 'menuItems',
      title: 'Menu Item list',
      description: 'Links displayed on the header of your site.',
      type: 'array',
      of: [
        {
          title: 'About page',
          type: 'reference',
          to: [
            {
              type: 'about',
            },
          ],
          options: {
            disableNew: true,
          },
        },
        {
          title: 'Link',
          name: 'navLink',
          type: 'object',
          icon: LinkIcon,
          fields: [
            {
              title: 'Title',
              name: 'title',
              type: 'string',
              description: 'Display Text'
            },
            {
              title: 'URL',
              name: 'url',
              type: 'url',
              description: 'enter an external URL',
              validation: Rule =>
              Rule.uri({
                scheme: ['http', 'https', 'mailto', 'tel']
              }),
            },
          ],
          preview: {
            select: {
              title: 'title',
              url: 'url'
            },
            prepare({ title, url }) {
              return {
                title: title,
                subtitle: url,
                media: LinkIcon,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'overview',
      description:
        'This text is your description. Used for the introduction paragraph at a Home page and also for the <meta> description tag for SEO.',
      title: 'Introduction text',
      type: 'object',
      fields:[
        {
        name: 'text',
        type: 'array',
        of: [
          // Paragraphs
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
        validation: (rule) => rule.max(155).required(),
        },
        {
          title: 'Display this introduction on Home page?',
          description: 'If you turn in off it still be used for SEO description',
          name: 'displayText',
          type: 'boolean',
        },
      ],
    }),
    defineField({
      name: 'ogImage',
      title: 'Loading Screen Image',
      type: 'image',
      description: 'Loading Screen Image. Displayed on social cards and search engine results. It should be 1200 X 630 pixels.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'favIcon',
      title: 'Favicon Image',
      type: 'image',
      description: 'Displayed on a tab in a browser before your website title.',
      options: {
        hotspot: true,
      },
    }),
   
  ],
  preview: {
    prepare() {
      return {
        title: 'Settings',
      }
    },
  },
})
