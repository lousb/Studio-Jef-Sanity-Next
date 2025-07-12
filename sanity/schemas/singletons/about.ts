import { BookIcon, LinkIcon, ImageIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: BookIcon,
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    defineField({
        type: 'string',
        name: 'title',
        title: 'Title',
        description: 'This is your title for About page that will be displayed in the header of your website.',
        validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'overview',
      description:
        'This field is for your About description.',
      title: 'Description',
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutMedia',
      title: 'About Media',
      description: '(Optional) Use either an image or a video for your About page.',
      type: 'object',
      icon: ImageIcon,
      fields: [
        {
          title: 'Image',
          name: 'media',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) => !!parent?.video,
          description: 'Use either an image or a video, not both.',
        },
        {
          title: 'Video',
          name: 'video',
          type: 'mux.video',
          hidden: ({ parent }) => !!parent?.media,
          description: 'Use either a video or an image, not both.',
        },
      ],
      preview: {
        select: {
          media: 'media',
          playbackId: 'video.asset.playbackId',
        },
        prepare({ media, playbackId }) {
          if (playbackId) {
            return {
              title: 'Video',
              subtitle: playbackId,
            }
          }
          if (media) {
            return {
              title: 'Image',
              subtitle: 'Image selected',
              media,
            }
          }
          return {
            title: 'No media selected',
          }
        },
      },
      validation: (Rule) =>
        Rule.custom((fields) => {
          const hasImage = !!fields?.media
          const hasVideo = !!fields?.video
          if (hasImage && hasVideo) {
            return 'Only one: image or video, not both.'
          }
          if (!hasImage && !hasVideo) {
            return 'Please select either an image or a video.'
          }
          return true
        }),
    }),
    defineField({
      name: 'aboutLinks',
      title: 'External links',
      description: '(Optional) Here you can add a list of external links, it will be displayed below your About description text.',
      type: 'array',
      of: [
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
  ],
  preview: {
    prepare() {
      return {
        title: 'About page',
      }
    },
  },
})
