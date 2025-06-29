'use client'

import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import styles from './ProjectPage.module.css'
import { Link } from 'next-view-transitions'
import Reveal from '../../global/Reveal'

import { Module } from '@/components/modules'
import { MoreProjects } from '@/components/pages/project/MoreProjects'
import { CustomPortableText } from '@/components/shared/CustomPortableText'
import type { ProjectPayload } from '@/types'
import type { HomePagePayload } from '@/types'
import RevealDiv from '@/components/global/revealDiv'

export interface ProjectPageProps {
  data: ProjectPayload | null
  moreProjects: HomePagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function ProjectPage({
  data,
  moreProjects,
  encodeDataAttribute,
}: ProjectPageProps) {
  const { year, overview, site, title, content, slug } = data ?? {}
  const { showcaseProjects = [] } = moreProjects ?? {}
  const projects = showcaseProjects
  const currentProjectIndex = projects.findIndex(
    (project) => project.slug === slug,
  )
  const prevProject = projects[currentProjectIndex - 1] || null
  const nextProject = projects[currentProjectIndex + 1] || null

  const titleRef = useRef<HTMLDivElement>(null)

  const [isInfoActive, setIsInfoActive] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size and update isMobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.matchMedia('(max-width: 868px)').matches)
    }

    // Initial check
    handleResize()

    // Add resize event listener
    window.addEventListener('resize', handleResize)

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Load state from localStorage or reset on project change
  useEffect(() => {
    const storedInfoState = localStorage.getItem('infoActive')
    setIsInfoActive(storedInfoState ? storedInfoState === 'true' : true)
  }, [slug])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('infoActive', isInfoActive.toString())
  }, [isInfoActive])

  // GSAP animations for entering and exiting
  useEffect(() => {
    if (titleRef.current) {
      const spans = titleRef.current.querySelectorAll('span')

      if (isInfoActive) {
        gsap.fromTo(
          spans,
          { y: '100%', opacity: 0 },
          {
            y: '0%',
            opacity: 1,
            duration: 0.4,
            ease: 'power3.out',
            stagger: 0.01,
            delay: 0.6,
          },
        )
      } else {
        gsap.to(spans, {
          y: '-100%',
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
          stagger: 0.01,
        })
      }
    }
  }, [isInfoActive])

  return (
    <div className={isInfoActive ? styles.infoActive : styles.infoInActive}>

      <div
        ref={titleRef}
        className={`w-full lg:w-2/4 ${styles.projectPageTitle}`}
      >
        {/* Title */}
        {title && (
          <Reveal element={'div'} elementClass={'text-2xl md:text-4xl'}>
            {title}
          </Reveal>
        )}
        {/* Year */}
        {year && (
          <Reveal element={'div'} elementClass={'md:mt-2 text-lg md:text-2xl'}>
            {year}
          </Reveal>
        )}
      </div>
      <button
        className={`mt-2 md:mt-4 text-lg md:text-xl ${styles.projectPageTitleInfo}`}
        onClick={() => setIsInfoActive((prev) => !prev)}
      >
        <Reveal>{isInfoActive ? 'Info -' : 'Info +'}</Reveal>
      </button>

      <div className={`mb-10 md:mb-20 space-y-6 ${styles.projectPage}`}>
        <div
          className={`flex flex-wrap justify-between flex-col md:flex-row ${styles.projectPageDetails}`}
        >
          <div className="w-full">
            {/* Overview */}
            {overview && (
              <Reveal element={'div'} elementClass={'text-xl md:text-2xl'}>
                <CustomPortableText value={overview} />
              </Reveal>
            )}
            {/* Site */}
            {site && (
              <div className="mt-3">
                {site && (
                  <Link
                    target="_blank"
                    className="text-xl break-words md:text-2xl underline"
                    href={site.url}
                  >
                    <Reveal
                      element={'div'}
                      elementClass={'text-xl break-words md:text-2xl underline'}
                    >
                      {site.urltitle}
                    </Reveal>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Display project content by type */}
          {content?.map((content, key) => (
            <RevealDiv delay={0.4} key={key}>
              <Module content={content} />
            </RevealDiv>
          ))}
        </div>

        {/* Previous and next project links */}
        {projects && <MoreProjects previous={prevProject} next={nextProject} />}
      </div>
    </div>
  )
}

export default ProjectPage