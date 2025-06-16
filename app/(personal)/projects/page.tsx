import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { AllProjectsPage } from '@/components/pages/allProjects/AllProjectsPage'
import { getAboutPage } from '@/sanity/loader/loadQuery'
import HomePage from '@/components/pages/home/HomePage'

const AllProjectPreview = dynamic(
  () => import('@/components/pages/allProjects/ProjectPagePreview'),
)

export default async function IndexRoute() {
  const initial = await getAboutPage()

  if (draftMode().isEnabled) {
    return <AllProjectPreview initial={initial} />
  }

  if (!initial.data) {
    return redirect('/')
  }

  return <HomePage data={initial.data} />
}
