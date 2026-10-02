'use client'
/**
 * This config is used to set up Sanity Studio that's mounted on the `app/studio/[[...index]]/page.tsx` route
 */

import { colorInput } from '@sanity/color-input'
import { visionTool } from '@sanity/vision'
import { defineConfig, NavbarProps, useWorkspace } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { media } from 'sanity-plugin-media'
import { muxInput } from 'sanity-plugin-mux-input';

import { apiVersion, dataset, projectId, studioUrl } from '@/sanity/lib/api'
import { Logo } from '@/sanity/plugins/Logo'
import * as resolve from '@/sanity/plugins/resolve'
import { pageStructure, singletonPlugin } from '@/sanity/plugins/settings'
import project from '@/sanity/schemas/documents/project'
import about from '@/sanity/schemas/singletons/about'
import home from '@/sanity/schemas/singletons/home'
import settings from '@/sanity/schemas/singletons/settings'
import architect from '@/sanity/schemas/tags/architect'
import client from '@/sanity/schemas/tags/client'
import credits from '@/sanity/schemas/tags/credits'
import genre from '@/sanity/schemas/tags/genre'
import projectType from '@/sanity/schemas/tags/projectType'
import technique from '@/sanity/schemas/tags/technique'

import { withFeaturedSync } from './sanity/actions/publishWithFeaturedSync'
import { SyncFeaturedMediaAction } from './sanity/actions/syncFeaturedMediaAction'
import { structure } from './sanity/structure'

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE ||
  'Studio Jef'

export default defineConfig({
  basePath: studioUrl,
  projectId: projectId || '',
  dataset: dataset || '',
  title,
  document: {
  actions: (prev, context) => {
    if (context.schemaType === 'home') {
      // Manual fallback; normally unnecessary since project publishes auto-sync
      return [...prev, SyncFeaturedMediaAction]
    }
    if (context.schemaType === 'project') {
      return prev.map((action) =>
        action.action === 'publish' ? withFeaturedSync(action) : action,
      )
    }
    return prev
  },
},
 
  schema: {
  types: [
    // Singletons
    home,
    about,
    settings,
    // Documents
    project,

    client,
    credits,
    genre,
    technique,
    architect,
    projectType,
  ],
},
  plugins: [
    structureTool({ structure }),

    presentationTool({
      resolve,
      previewUrl: {
        previewMode: {
          enable: '/api/draft',
        },
      },
    }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin([home.name, settings.name, about.name]),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    colorInput(),
    media(),
  ],
})