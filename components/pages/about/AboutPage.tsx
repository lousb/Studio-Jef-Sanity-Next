'use client'

import React, { useEffect, useState } from 'react'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import { Link } from 'next-view-transitions'

import AboutImageBox from '@/components/shared/AboutImageBox'
import Reveal from '@/components/global/Reveal'
import { CustomPortableText } from '@/components/shared/CustomPortableText'
import { InfiniteLoop } from '@/components/global/InfiniteLoop'
import { colsToWidth } from '@/lib/gridWidth'
import type { AboutPayload } from '@/types'
import styles from '@/components/pages/project/ProjectPage.module.css'

export interface AboutPageProps {
  data: AboutPayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

const MOBILE_BREAKPOINT = 768

// Local to AboutPage only — not a shared hook
function useIsAboutPageMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const update = () => setIsMobile(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return isMobile
}

interface SectionProps {
  overview: AboutPayload['overview']
  aboutLinks: AboutPayload['aboutLinks']
  media: AboutPayload['media']
  services: AboutPayload['services']
  press: AboutPayload['press']
  location: AboutPayload['location']
}

function AboutMeta({ services, press, location }: Pick<SectionProps, 'services' | 'press' | 'location'>) {
  return (
    <>
      <div>
        Services
        {services?.length ? (
          <div>
            {services.map((s, i) => (
              <span key={i}>
                {s}
                {i < services.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        Press
        {press?.length ? (
          <div>
            {press.map((p, i) => (
              <span key={i}>
                {p}
                <br />
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        Location
        {location?.length ? (
          <div>
            {location.map((l, i) => (
              <span key={i}>
                {l}
                {i < location.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </>
  )
}

function MobileAbout({ overview, aboutLinks, media, services, press, location }: SectionProps) {
  return (
    <div>
      {/* Section 1: 90vh hero — links stacked, centered */}
      <div className="flex mobile-media flex-col gap-4 text-center px-6" style={{ minHeight: '90vh' }}>
        {aboutLinks?.map((link, key) => (
          <Reveal key={key} element="div" elementClass="break-words hyphens-auto">
            <Link target="_blank" className="break-words" href={link.url!}>
              {link.title}
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Section 2: overview */}
      {overview && (
        <div className="px-6 mb-10">
          <CustomPortableText value={overview} />
        </div>
      )}

      {/* Section 3: photos — static stack, no infinite loop on mobile */}
      <div className="space-y-6 project-page-media ">
        <div className="flex flex-col items-center gap-[20px] bg-white w-full px-6 ">
          {media?.map((item, key) => (
            <div key={item._key ?? key} data-media-block className="w-full">
              <AboutImageBox
                image={item.media}
                alt={item.caption || 'About image'}
                classesWrapper="relative"
              />
              {item.caption && (
                <span className="block mt-2 opacity-60">{item.caption}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="project-page-meta px-6"
        style={{ marginTop: '1rem', marginBottom: '1rem', opacity: 0.6 }}
      >
        <AboutMeta services={services} press={press} location={location} />
      </div>
    </div>
  )
}

function DesktopAbout({ overview, aboutLinks, media, services, press, location }: SectionProps) {
  return (
    <div className={`${styles.infoActive} info-active`}>
      <div className="space-y-6 project-page-media">
        <div className="relative z-10 gap-[10px] bg-white flex justify-center w-full">
          <InfiniteLoop>
            {media?.map((item, key) => (
              <div
                key={item._key ?? key}
                data-media-block
                className="mb-[10px] flex-shrink-0 mx-3"
                style={{ width: colsToWidth(6) }}
              >
                <AboutImageBox
                  image={item.media}
                  alt={item.caption || 'About image'}
                  classesWrapper="relative"
                />
                {item.caption && (
                  <span className="block mt-2 opacity-60">{item.caption}</span>
                )}
              </div>
            ))}
          </InfiniteLoop>
        </div>
      </div>

      <div className={`w-full md:w-2/4 flex ${styles.projectPageTitle} project-page-title flex-col`}>
        <div className={`project-page-details ${styles.projectPageDetails}`}>
          <div className={`flex flex-col ${styles.projectPageDetailsInner}`}>
            {overview && (
              <div className="flex flex-wrap justify-between flex-col md:flex-row project-page-details">
                <div className="w-full">
                  <CustomPortableText value={overview} />
                </div>
              </div>
            )}

            <div>
              {aboutLinks?.map((link, key) => (
                <Reveal key={key} element="div" elementClass="break-words hyphens-auto">
                  <Link target="_blank" className="break-words" href={link.url!}>
                    {link.title}
                  </Link>
                </Reveal>
              ))}
            </div>

            <div
              className="project-page-meta"
              style={{ marginTop: '1rem', marginBottom: '1rem', opacity: 0.6 }}
            >
              <AboutMeta services={services} press={press} location={location} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AboutPage({ data }: AboutPageProps) {
  const { overview, aboutLinks, media, services, press, location } = data ?? {}
  const isMobile = useIsAboutPageMobile()

  if (isMobile === null) return null // avoids a hydration flash before viewport is measured

  const sectionProps: SectionProps = { overview, aboutLinks, media, services, press, location }

  return isMobile ? <MobileAbout {...sectionProps} /> : <DesktopAbout {...sectionProps} />
}

export default AboutPage