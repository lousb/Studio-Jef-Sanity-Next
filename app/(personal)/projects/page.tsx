import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { AllProjectsPage } from '@/components/pages/allProjects/AllProjectsPage'
import { loadHomePage } from '@/sanity/loader/loadQuery'

const AllProjectPreview = dynamic(
  () => import('@/components/pages/allProjects/ProjectPagePreview'),
)

export default async function IndexRoute() {
  const initial = await loadHomePage()

  if (draftMode().isEnabled) {
    return <AllProjectPreview initial={initial} />
  }

  if (!initial.data) {
    return redirect('/')
  }

  return <AllProjectsPage data={initial.data} />
}
