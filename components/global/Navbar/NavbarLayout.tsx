'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

import { urlForLogo } from '@/sanity/lib/utils'
import type { LinkItem, PageItem, SettingsPayload } from '@/types'

interface NavbarProps {
  data: SettingsPayload
  title: string | null
  logo: any | null
  projectCount?: number
}

export default function Navbar(props: NavbarProps) {
  const { data, projectCount } = props
  const title = props.title ?? ''
  const pathname = usePathname()

  const isProjectsPage = pathname === '/projects';
    const isAboutPage = pathname === '/about'

  const customLogo = props?.logo
  const logoImageUrl = customLogo && urlForLogo(customLogo)?.url()

  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY === 0)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
    className={`header flex flex-row flex-nowrap items-center gap-x-5 px-4 py-4 md:px-5 md:py-4 lg:px-5 top-layer w-full pointer-events-none transition-transform duration-300 ${        
      isVisible ? 'scroll-hidden' : 'scroll-visible'
      }`}
    >
      {customLogo ? (
        <div className="flex h-6 w-[18%]">
          <Link href="/" className="h-full text-xl hover:text-secondary md:text-1xl">
            <Image
              alt={title}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: 'auto', height: '24px' }}
              src={logoImageUrl}
            />
          </Link>
        </div>
      ) : (
        <Link href="/" className="h-full text-1xl hover:text-secondary md:text-1xl">
          {title}
        </Link>
      )}

      <div className="flex flex-wrap md:mt-0 md:text-1xl w-[30.5%]">
        {isProjectsPage ? (
          <span className="text-gray-400 cursor-default pl-2">
            Works
            {projectCount !== undefined && (
              <sup className="translate-y-[0.3em]">{projectCount}</sup>
            )}
          </span>
        ) : (
          <Link
            href="/projects"
            className="h-full text-1xl hover:text-secondary md:text-1xl pl-2"
          >
            Works
            {projectCount !== undefined && (
              <sup className="translate-y-[0.3em]">{projectCount}</sup>
            )}
          </Link>
        )}

        {isAboutPage ? (
          <span className="text-gray-400 cursor-default pl-2">About</span>
        ) : (
          <Link
            href="/about"
            className="h-full text-1xl hover:text-secondary md:text-1xl pl-2"
          >
            About
          </Link>
        )}
      </div>

      <a
        href="mailto:contact@aw-studio.world"
        className="gap-3 mt-4 md:mt-0 text-right md:text-1xl absolute right-[1.25rem]"
      >
        Let’s Work →
      </a>
    </div>
  )
}
