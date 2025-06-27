'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from 'next-view-transitions'

import { HeaderLinks } from '@/components/shared/HeaderLinks'
import { resolveHref, urlForLogo } from '@/sanity/lib/utils'
import type { LinkItem, PageItem, SettingsPayload } from '@/types'

interface NavbarProps {
  data: SettingsPayload
  title: string | null
  logo: any | null
  projectCount?: number // Add this property
}

export default function Navbar(props: NavbarProps) {
  const { data } = props
  const title = props.title ?? ''

  const menuItems = data?.menuItems ?? {}
  const menuPages = menuItems?.page || ([] as PageItem[])
  const menuLinks = menuItems?.link || ([] as LinkItem[])

  const customLogo = props?.logo
  const logoImageUrl = customLogo && urlForLogo(customLogo)?.url()

  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY < lastScrollY || currentScrollY === 0) {
        setIsVisible(true) // Show header when scrolling up or at the top
      } else {
        setIsVisible(false) // Hide header when scrolling down
      }
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`header flex flex-wrap justify-between items-center gap-x-5 px-4 py-4 md:px-5 md:py-4 lg:px-5 top-layer grid grid-cols-3 md:grid-cols-3 gap-3 w-full transition-transform duration-300 ${
        isVisible ? 'scroll-hidden' : 'scroll-visible'
      }`}
    >
      {customLogo && customLogo ? (
        <div className="flex h-6">
          <Link
            href={`/`}
            className={`h-full text-xl hover:text-secondary md:text-1xl`}
          >
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
        <Link
          href={`/`}
          className={`h-full text-1xl hover:text-secondary md:text-1xl`}
        >
          {title}
        </Link>
      )}
      <div className="flex flex-wrap mt-4 md:mt-0 md:text-1xl">
        <Link
          href={`/projects`}
          className={`h-full text-1xl hover:text-secondary md:text-1xl pl-2`}
        >
          Works
          {props.projectCount !== undefined && (
            <sup className="translate-y-[0.3em]">{props.projectCount}</sup>
          )}
        </Link>
        <Link
          href={`/about`}
          className={`h-full text-1xl hover:text-secondary md:text-1xl pl-2`}
        >
          About
        </Link>
      </div>
      <a
        href="mailto:contact@aw-studio.world"
        className="gap-3 mt-4 md:mt-0 text-right w-full md:text-1xl"
      >
        Let’s Work →
      </a>
    </div>
  )
}