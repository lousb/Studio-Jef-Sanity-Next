import { FeaturedMediaPreview } from '@/sanity/components/FeaturedMediaPreview'
import { HomeIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  icon: HomeIcon,
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    defineField({
      name: 'title',
      description: 'This field is the title of your personal website.',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'customLogo',
      description: 
        'Upload your custom logo, it will replace your title in the header of your website. Use SVG or PNG with a transparent background.',
      title: 'Custom logo (Optional)',
      type: 'image',
    }),
    
    defineField({
  name: 'featuredMedia',
  title: 'Featured media',
  description: 'Auto-synced from project media marked "Featured". Drag to reorder.',
  type: 'array',
  components: {
    input: (props) => props.renderDefault({
      ...props,
      arrayFunctions: () => null, // hides the "+ Add item" toolbar; drag handles on each row are unaffected
    }),
  },
  of: [
    defineArrayMember({
  type: 'object',
  name: 'featuredMediaItem',
  fields: [
    { name: 'project', type: 'reference', to: [{ type: 'project' }], readOnly: true },
    { name: 'mediaKey', title: 'Media key', type: 'string', readOnly: true },
  ],
  components: {
    preview: FeaturedMediaPreview,
  },
}),
  ],
}),

  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        subtitle: 'Home',
        title,
      }
    },
  },
})
