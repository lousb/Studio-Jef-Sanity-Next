'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { PortableText } from '@portabletext/react'

import { urlForLogo } from '@/sanity/lib/utils'
import type { LinkItem, PageItem, SettingsPayload } from '@/types'
import Reveal from '../Reveal'
import { useLenis } from '../LenisProvider'

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

  const isProjectsPage = pathname === '/projects'
  const isAboutPage = pathname === '/about'

  const customLogo = props?.logo
  const logoImageUrl = customLogo && urlForLogo(customLogo)?.url()

  const [isVisible, setIsVisible] = useState(true)
  const lenis = useLenis()

  const [logoWidth, setLogoWidth] = useState('685px')

  useEffect(() => {
    if (!lenis) return

    setIsVisible(true)

    let lastScrollY: number | null = null

    const handleScroll = ({ scroll }: { scroll: number }) => {
      // ignore programmatic jumps from InfiniteLoop's teleport — just resync silently
      if ((lenis as any).__isProgrammaticJump) {
        lastScrollY = scroll
        return
      }

      if (lastScrollY === null) {
        lastScrollY = scroll
        return
      }

      const delta = scroll - lastScrollY

      if (scroll <= 0) {
        setIsVisible(true)
        lastScrollY = scroll
        return
      }

      if (Math.abs(delta) < 50) return

      setIsVisible(delta < 0)
      lastScrollY = scroll
    }

    lenis.on('scroll', handleScroll)

    return () => {
      lenis.off('scroll', handleScroll)
    }
  }, [lenis])

  return (
    <div
      className={`header top-layer w-full pointer-events-none transition-transform duration-300
        grid grid-cols-[repeat(var(--grid-columns-mobile),1fr)] md:grid-cols-[repeat(var(--grid-columns-desktop),1fr)]
        gap-x-[var(--grid-gutter-mobile)] md:gap-x-[var(--grid-gutter-desktop)]
        px-[var(--grid-margin-mobile)] md:px-[var(--grid-margin-desktop)]
        py-4 items-start
        ${isVisible ? 'scroll-hidden' : 'scroll-visible'}`}
    >
      <div className="flex flex-wrap flex-col gap-[10px] md:mt-0 md:text-1xl w-full">
        <Link href="/" className="h-full text-1xl hover:text-secondary md:text-1xl">
          Home
        </Link>
        {isProjectsPage ? (
          <span className="text-gray-400 cursor-default">Projects</span>
        ) : (
          <Link href="/projects" className="h-full text-1xl hover:text-secondary md:text-1xl">
            Projects
          </Link>
        )}

        {isAboutPage ? (
          <span className="text-gray-400 cursor-default pl-2">Studio</span>
        ) : (
          <Link href="/about" className="h-full text-1xl hover:text-secondary md:text-1xl">
            Studio
          </Link>
        )}
      </div>

      {data?.overview?.text && (
        <h2 className="main-desc text-body-01 [grid-column:1/9] md:[grid-column:19/25] z-[9999]">
          <PortableText value={data.overview.text} />
        </h2>
      )}

      {customLogo ? (
        <Image
          src={logoImageUrl}
          alt="Logo"
          width={685}
          height={274}
          className="fixed-logo h-auto"
        />
      ) : null}
    </div>
  )
}