import type { MetadataRoute } from 'next'
import { groq } from 'next-sanity'

import { absoluteUrl } from '@/lib/site'
import { loadQuery } from '@/sanity/loader/loadQuery'

type SitemapData = {
  home?: string
  about?: string
  projects: { slug: string; _updatedAt: string }[]
}

const sitemapQuery = groq`{
  "home": *[_type == "home"][0]._updatedAt,
  "about": *[_type == "about"][0]._updatedAt,
  "projects": *[_type == "project" && defined(slug.current)] | order(_updatedAt desc){
    "slug": slug.current,
    _updatedAt
  }
}`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await loadQuery<SitemapData>(
    sitemapQuery,
    {},
    { next: { tags: ['home', 'about', 'project'] } },
  )

  const projects = data?.projects ?? []
  const latestProject = projects[0]?._updatedAt

  return [
    {
      url: absoluteUrl('/'),
      lastModified: data?.home ?? new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/projects'),
      lastModified: latestProject ?? new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...(data?.about
      ? [
          {
            url: absoluteUrl('/studio'),
            lastModified: data.about,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
          },
        ]
      : []),
    ...projects.map((p) => ({
      url: absoluteUrl(`/projects/${p.slug}`),
      lastModified: p._updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
