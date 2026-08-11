'use client'

import React from 'react'
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

export function AboutPage({ data }: AboutPageProps) {
  const { overview, aboutLinks, media, services, press, location } = data ?? {}

  return (
    <div className={`${styles.infoActive} info-active`}>
      {/* Media row — horizontally centered, infinite looped like project-page-media */}
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

      {/* Title column — mirrors project-page-title exactly */}
      <div className={`w-full lg:w-2/4 flex ${styles.projectPageTitle} project-page-title flex-col`}>
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
                  <Link
                    target="_blank"
                    className="break-words"
                    href={link.url!}
                  >
                    {link.title}
                  </Link>
                </Reveal>
              ))}
            </div>

            <div
              className="project-page-meta"
              style={{ marginTop: '1rem', marginBottom: '1rem', opacity: 0.6 }}
            >
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage