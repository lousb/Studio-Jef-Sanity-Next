import type { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { toPlainText } from 'next-sanity'

import { ProjectPage } from '@/components/pages/project/ProjectPage'
import { urlForOpenGraphImage } from '@/sanity/lib/utils'
import { generateStaticSlugs } from '@/sanity/loader/generateStaticSlugs'
import { loadMoreProjects, loadProject } from '@/sanity/loader/loadQuery'

const ProjectPreview = dynamic(() => import('@/components/pages/project/ProjectPreview'))

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { data: project } = await loadProject(params.slug)
  const ogImage = urlForOpenGraphImage(project?.coverImage)

  return {
    title: project?.title,
    description: project?.overview
      ? toPlainText(project.overview)
      : (await parent).description,
    openGraph: ogImage
      ? {
          images: [ogImage, ...((await parent).openGraph?.images || [])],
        }
      : {},
  }
}

export function generateStaticParams() {
  return generateStaticSlugs('project')
}

export default async function ProjectSlugRoute({ params }: Props) {
  const [initial, moreProjects] = await Promise.all([
    loadProject(params.slug),
    loadMoreProjects(),
  ])

  if (!initial || !initial.data) {
    console.error('Project not found:', params.slug) // Debugging
    notFound()
  }

  if (draftMode().isEnabled) {
    return <ProjectPreview params={params} initial={initial} />
  }

  return <ProjectPage data={initial.data}  />
}