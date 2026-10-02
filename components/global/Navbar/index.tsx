import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

import {
  getHomePageTitle,
  loadHomePage,
  loadProjectsPage,
  loadSettings,
} from '@/sanity/loader/loadQuery'

import NavbarLayout from './NavbarLayout'
const NavbarPreview = dynamic(() => import('./NavbarPreview'))

export async function Navbar() {
  const [initial, title, customLogo, projects] = await Promise.all([
    loadSettings(),
    getHomePageTitle(),
    loadHomePage(),
    loadProjectsPage(),
  ])

  const projectCount = projects.data?.length || 0

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