import type { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { toPlainText } from 'next-sanity'

import { ProjectPage } from '@/components/pages/project/ProjectPage'
import { JsonLd } from '@/components/shared/JsonLd'
import { absoluteUrl } from '@/lib/site'
import { urlForOpenGraphImage } from '@/sanity/lib/utils'
import { generateStaticSlugs } from '@/sanity/loader/generateStaticSlugs'
import { loadProject } from '@/sanity/loader/loadQuery'

const ProjectPreview = dynamic(() => import('@/components/pages/project/ProjectPreview'))

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { data: project } = await loadProject(params.slug)
  if (!project) return {}

  const parentMeta = await parent
  const description = project.overview?.length
    ? toPlainText(project.overview)
    : parentMeta.description ?? undefined
  const ogImage = urlForOpenGraphImage(project.coverImage?.media)
  const path = `/projects/${params.slug}`

  return {
    title: project.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      url: path,
      title: project.title,
      description,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: project.title }]
        : parentMeta.openGraph?.images || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export function generateStaticParams() {
  return generateStaticSlugs('project')
}

export default async function ProjectSlugRoute({ params }: Props) {
  const initial = await loadProject(params.slug)

  if (!initial?.data) {
    notFound()
  }

  if (draftMode().isEnabled) {
    return <ProjectPreview params={params} initial={initial} />
  }

  const project = initial.data
  const image = urlForOpenGraphImage(project.coverImage?.media)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          url: absoluteUrl(`/projects/${params.slug}`),
          ...(project.overview?.length ? { description: toPlainText(project.overview) } : {}),
          ...(image ? { image } : {}),
          ...(project.year ? { dateCreated: project.year } : {}),
          ...(project.location ? { locationCreated: { '@type': 'Place', name: project.location } } : {}),
          creator: { '@id': absoluteUrl('/#organization') },
        }}
      />
      <ProjectPage data={project} />
    </>
  )
}
