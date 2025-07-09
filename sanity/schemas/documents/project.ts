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
      title: 'Cover Media',
      description:
        'This is the featured image or video shown on the homepage and as the project cover. Choose either an image or a video, not both.',
      type: 'object',
      fields: [
        {
          title: 'Image',
          name: 'image',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) => !!parent?.video,
        },
        {
          title: 'Video',
          name: 'video',
          type: 'mux.video',
          hidden: ({ parent }) => !!parent?.image,
        },
      ],
      validation: (Rule) =>
        Rule.custom((fields) => {
          const hasImage = !!fields?.image;
          const hasVideo = !!fields?.video;
          if (hasImage && hasVideo) {
            return 'Only one media type is allowed: image or video.';
          }
          if (!hasImage && !hasVideo) {
            return 'Please add an image or a video.';
          }
          return true;
        }),
      preview: {
        select: {
          image: 'image',
          playbackId: 'video.asset.playbackId',
        },
        prepare({ image, playbackId }) {
          if (image) {
            return {
              title: 'Cover Media - Image',
              media: image,
            };
          }
          if (playbackId) {
            return {
              title: 'Cover Media - Video',
              subtitle: playbackId,
            };
          }
          return {
            title: 'Cover Media',
            subtitle: 'No media selected',
          };
        },
      },
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

    // Inline tags
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'genre' }] },
      ],
      description: 'Pick from existing genres or add a new one.',
    }),
    defineField({
      name: 'technique',
      title: 'Technique',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'technique' }] },
      ],
      description: 'Pick from existing techniques or add a new one.',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'client' }] },
      ],
      description: 'Pick from existing clients or add a new one.',
    }),
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [
        { type: 'reference', to: [{ type: 'credits' }] },
      ],
      description: 'Pick from existing credits or add a new one.',
    }),
     

    // Content blocks
    defineField({
      title: 'Content builder',
      description: 'This is a content builder for your project page, choose content type and add your content. You can rearrange your blocks later.',
      name: 'content',
      type: 'array',
      of: [
        // Single image block
        defineArrayMember({
          title: 'Single Image',
          name: 'singleImage',
          type: 'object',
          icon: ImageIcon,
          fields: [
            {
              title: 'Photo',
              name: 'photo',
              type: 'image',
              options: {
                hotspot: true
              },
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string',
              description: '(Optional) Caption below the image',
            },
            {
              title: 'Featured',
              name: 'featured',
              type: 'boolean',
              description: 'Mark this image as a featured image',
            },
          ],
          preview: {
            select: {
              photo: 'photo'
            },
            prepare({ photo }) {
              return {
                title: 'Single image',
                media: photo
              }
            },
          },
        }),
        // Two images block
        defineArrayMember({
          title: 'Two Images',
          name: 'twoImages',
          type: 'object',
          icon: ImageIcon,
          fields: [
            {
              title: 'Left photo',
              name: 'photoOne',
              type: 'image',
              options: {
                hotspot: true
              },
            },
            {
              title: 'Right photo',
              name: 'photoTwo',
              type: 'image',
              options: {
                hotspot: true
              },
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string',
              description: '(Optional) Caption below 2 images',
            },
            {
              title: 'Featured',
              name: 'featured',
              type: 'boolean',
              description: 'Mark this image as a featured image',
            },
          ],
          preview: {
            select: {
              photo: 'photoOne'
            },
            prepare({ photo }) {
              return {
                title: 'Two images',
                media: photo
              }
            },
          },
        }),
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
        // Single video
        defineArrayMember({
          title: 'Single Video (Youtube/Video link)',
          name: 'singleVideo',
          type: 'object',
          icon: PlayIcon,
          fields: [
            {
              title: 'Youtube or Vimeo link',
              name: 'videoLink',
              type: 'url',
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string',
              description: '(Optional) Caption below the video',
            },
            {
              title: 'Featured',
              name: 'featured',
              type: 'boolean',
              description: 'Mark this video as a featured image',
            },
          ],
          preview: {
            select: {
              link: 'videoLink'
            },
            prepare({ link }) {
              return {
                title: 'Single video',
                subtitle: link
              }
            },
          },
        }),

        defineArrayMember({
          title: "Video",
          name: "video",
          type: "mux.video",
          preview: {
            select: {
              playbackId: "asset.playbackId",
              title: "title",
            },
            prepare({ playbackId, title }) {
              return {
                title: title || "Untitled Video",
                subtitle: playbackId ? `${playbackId}` : "No video selected",
              };
            },
          },
        }),

        // Two videos
        defineArrayMember({
          title: 'Two Videos (Youtube/Video link)',
          name: 'twoVideos',
          type: 'object',
          icon: PlayIcon,
          fields: [
            {
              title: 'Left video (Youtube/Video link)',
              name: 'videoOneLink',
              type: 'url',
            },
            {
              title: 'Right video (Youtube/Video link)',
              name: 'videoTwoLink',
              type: 'url',
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string',
              description: '(Optional) Caption below 2 videos',
            },
            {
              title: 'Featured',
              name: 'featured',
              type: 'boolean',
              description: 'Mark this image as a featured image',
            },
          ],
          preview: {
            select: {
              linkOne: 'videoOneLink',
              linkTwo: 'videoTwoLink'
            },
            prepare({ linkOne, linkTwo }) {
              return {
                title: 'Two videos',
                subtitle: linkOne + ` + ` + linkTwo
              }
            },
          },
        }), 

        defineArrayMember({
          name: 'hybridMedia',
          title: 'Hybrid Media',
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
              description: 'Mark this media as featured.',
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
                };
              }
              if (media) {
                return {
                  title: 'Image',
                  subtitle: 'Image selected',
                  media,
                };
              }
              return {
                title: 'Hybrid Media',
                subtitle: 'No media selected',
              };
            },
          },
          validation: (Rule) =>
            Rule.custom((fields: any) => {
              const hasImage = !!fields?.media;
              const hasVideo = !!fields?.video;
              if (hasImage && hasVideo) {
                return 'Only one: image or video, not both.';
              }
              if (!hasImage && !hasVideo) {
                return 'Please select either an image or a video.';
              }
              return true;
            }),
        }),
        



        defineArrayMember({
          name: 'twoHybridMedia',
          title: 'Two Hybrid Media',
          type: 'object',
          icon: ImageIcon,
          fields: [
            {
              title: 'Left Image',
              name: 'leftImage',
              type: 'image',
              options: { hotspot: true },
              hidden: ({ parent }) => !!parent?.leftVideo,
              description: 'Either use an image or a video on the left side.',
            },
            {
              title: 'Left Video',
              name: 'leftVideo',
              type: 'mux.video',
              hidden: ({ parent }) => !!parent?.leftImage,
              description: 'Either use an image or a video on the left side.',
            },
            {
              title: 'Right Image',
              name: 'rightImage',
              type: 'image',
              options: { hotspot: true },
              hidden: ({ parent }) => !!parent?.rightVideo,
              description: 'Either use an image or a video on the right side.',
            },
            {
              title: 'Right Video',
              name: 'rightVideo',
              type: 'mux.video',
              hidden: ({ parent }) => !!parent?.rightImage,
              description: 'Either use an image or a video on the right side.',
            },
            {
              title: 'Caption',
              name: 'caption',
              type: 'string',
              description: '(Optional) Caption below the two media items.',
            },
            {
              title: 'Featured',
              name: 'featured',
              type: 'boolean',
              description: 'Mark this media set as featured.',
            },
          ],
          preview: {
            select: {
              leftImage: 'leftImage',
              leftPlaybackId: 'leftVideo.asset.playbackId',
              rightImage: 'rightImage',
              rightPlaybackId: 'rightVideo.asset.playbackId',
            },
            prepare({ leftImage, leftPlaybackId, rightImage, rightPlaybackId }) {
              const leftLabel = leftPlaybackId ? 'Video' : leftImage ? 'Image' : 'None';
              const rightLabel = rightPlaybackId ? 'Video' : rightImage ? 'Image' : 'None';
              return {
                title: 'Two Hybrid Media',
                subtitle: `Left: ${leftLabel}, Right: ${rightLabel}`,
                media: leftImage || rightImage || undefined,
              };
            },
          },
          validation: (Rule) =>
            Rule.custom((fields) => {
              const hasLeft = !!fields?.leftImage || !!fields?.leftVideo;
              const hasRight = !!fields?.rightImage || !!fields?.rightVideo;
              const hasBothLeft = !!fields?.leftImage && !!fields?.leftVideo;
              const hasBothRight = !!fields?.rightImage && !!fields?.rightVideo;
        
              if (!hasLeft || !hasRight) {
                return 'Both left and right sides must have either an image or a video.';
              }
              if (hasBothLeft) {
                return 'Only one media type (image or video) allowed on the left side.';
              }
              if (hasBothRight) {
                return 'Only one media type (image or video) allowed on the right side.';
              }
              return true;
            }),
        })
        
        
        
        

               
      ],
    }),
  ],
})
