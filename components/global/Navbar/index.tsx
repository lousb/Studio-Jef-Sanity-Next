import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

import {
  getHomePageTitle,
  loadHomePage,
  loadSettings,
} from '@/sanity/loader/loadQuery'

import NavbarLayout from './NavbarLayout'
const NavbarPreview = dynamic(() => import('./NavbarPreview'))

export async function Navbar() {
  const initial = await loadSettings()
  const title = await getHomePageTitle()
  const customLogo = await loadHomePage()

  // Extract showcaseProjects and calculate projectCount
  const showcaseProjects = customLogo.data?.showcaseProjects || []
  const projectCount = showcaseProjects.length

  if (draftMode().isEnabled) {
    return (
      <NavbarPreview
        initial={initial}
        title={title.data}
        logo={customLogo.data?.customLogo}
        // Optionally pass projectCount to NavbarPreview if needed
      />
    )
  }

  return (
    <NavbarLayout
      data={initial.data}
      title={title.data}
      logo={customLogo.data?.customLogo}
      projectCount={projectCount} // Pass projectCount to NavbarLayout
    />
  )
}