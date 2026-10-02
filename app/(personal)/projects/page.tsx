import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { AllProjectsPage } from '@/components/pages/allProjects/AllProjectsPage'
import { loadProjectsPage } from '@/sanity/loader/loadQuery'

const AllProjectPreview = dynamic(() => import('@/components/pages/allProjects/ProjectPagePreview'))

export const metadata: Metadata = {
  title: 'Projects',
  alternates: { canonical: '/projects' },
  openGraph: { url: '/projects' },
}

export default async function ProjectsRoute() {
  const initial = await loadProjectsPage()

  if (draftMode().isEnabled) {
    return <AllProjectPreview initial={initial} />
  }

  const data = initial.data ?? []
  if (data.length === 0) {
    return redirect('/')
  }

  return (
    <>
      <h1 className="sr-only">Projects</h1>
      <AllProjectsPage data={{ allProjects: data }} />
    </>
  )
}
