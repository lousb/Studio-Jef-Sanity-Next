import { ImageIcon } from '@sanity/icons'

export default {
  name: 'hybridMediaSingle',
  title: 'Single Hybrid Media',
  type: 'object',
  icon: ImageIcon,
  fields: [
    {
      name: 'media',
      title: 'Media',
      type: 'object',
      fields: [
        {
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
        },
        {
          name: 'video',
          title: 'Video',
          type: 'mux.video',
        },
      ],
      validation: Rule =>
        Rule.custom(value => {
          if (!value) return 'Required field';
          if (value.image && value.video) return 'Only one media allowed';
          if (!value.image && !value.video) return 'One media required';
          return true;
        }),
      preview: {
        select: {
          image: 'image',
          videoPlaybackId: 'video.asset.playbackId',
        },
        prepare({ image, videoPlaybackId }) {
          if (videoPlaybackId) {
            return {
              title: 'Video',
              subtitle: videoPlaybackId,
            }
          }
          if (image) {
            return {
              title: 'Image',
              media: image,
            }
          }
          return {
            title: 'No media selected',
          }
        },
      },
    },
    {
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: '(Optional) Caption below the media',
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Mark this media as a featured image',
    },
  ],
  preview: {
    select: {
      media: 'media',
    },
    prepare({ media }) {
      if (!media) {
        return {
          title: 'Single Hybrid Media',
          subtitle: 'No media selected',
        }
      }
      const isVideo = media._type === 'mux.video'
      const playbackId = isVideo ? media?.asset?.playbackId : null

      return {
        title: isVideo ? 'Video' : 'Image',
        subtitle: isVideo
          ? playbackId || 'No video selected'
          : 'Image selected',
        media: isVideo ? undefined : media,
      }
    },
  },
}
