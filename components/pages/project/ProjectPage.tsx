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

interface ProjectPageProps {
  data: ProjectPayload | null
  moreProjects: ProjectPayload[] // now just an array of projects
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function ProjectPage({
  data,
  moreProjects,
  encodeDataAttribute,
}: ProjectPageProps) {
  const { year, overview, site, client, title, content, slug } = data ?? {}

  const projects = moreProjects || []
  const currentProjectIndex = projects.findIndex((project) => project.slug === slug)

  const prevProject = projects[currentProjectIndex - 1] || null
  const nextProject = projects[currentProjectIndex + 1] || null

  const titleRef = useRef<HTMLDivElement>(null)
   const titleHeadingRef = useRef<HTMLDivElement>(null)

  const [isInfoActive, setIsInfoActive] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [shouldShowTitleBlock, setShouldShowTitleBlock] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false) // To track if animation is running

  // Detect scroll position and update states
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 100
      setHasScrolled(scrolled)
    }

    window.addEventListener('scroll', onScroll)
    onScroll() // initial check

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Update title visibility based on infoActive and scroll position
  useEffect(() => {
    const visible = isInfoActive || !hasScrolled
    setShouldShowTitleBlock(visible)

    // Only trigger GSAP animations when scrolled past 100px (and avoid retriggering at the top)
    if (titleRef.current && shouldShowTitleBlock !== visible && !isAnimating) {
      setIsAnimating(true) // Set animation state to true when animation starts

      const spans = titleRef.current.querySelectorAll('span')

      // Run animation only if the title block should be visible
      if (visible) {
        gsap.to(spans, {
          y: '0%',
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
          stagger: 0.01,
          onComplete: () => setIsAnimating(false), // Reset animation state when animation completes
        })
      } else {
        gsap.to(spans, {
          y: '-100%',
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
          stagger: 0.01,
          onComplete: () => setIsAnimating(false), // Reset animation state when animation completes
        })
      }
    }
  }, [isInfoActive, hasScrolled, shouldShowTitleBlock])

  // Load state from localStorage or reset on project change
  useEffect(() => {
    const storedInfoState = localStorage.getItem('infoActive')
    setIsInfoActive(storedInfoState ? storedInfoState === 'true' : true)
  }, [slug])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('infoActive', isInfoActive.toString())
  }, [isInfoActive])

  return (
    <div className={`${isInfoActive ? `${styles.infoActive} info-active` : styles.infoInActive}`}>
      <div ref={titleRef} className={`w-full lg:w-2/4 flex ${styles.projectPageTitle} project-page-title flex-col`}>
        {/* Title */}
        <div ref={titleHeadingRef}>
          {title && (
            <Reveal element={'div'} elementClass={'text-2xl md:text-4xl break-words hyphens-auto'}>
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

        <div>
           {overview && (
            <div className={`flex flex-wrap justify-between flex-col md:flex-row ${styles.projectPageDetails} project-page-details`}>
              <div className="w-full">
                {/* Overview */}
                <Reveal element={'div'} elementClass={'text-xl md:text-2xl'}>
                  <CustomPortableText value={overview} />
                </Reveal>

                {/* Site */}
                {site && (
                  <div className="mt-3">
                    {site && (
                      <Link
                        target="_blank"
                        className="text-xl break-words md:text-2xl underline"
                        href={site.url}
                      >
                        <Reveal element={'div'} elementClass={'text-xl break-words md:text-2xl underline'}>
                          {site.urltitle}
                        </Reveal>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div style={{ marginTop: '1rem', marginBottom: '1rem', opacity: 0.6 }}>
            {client?.map((client, i) => (
              <span key={i}>
                {client.title}
                <br />
              </span>
            ))}
          </div>
         
        </div>
      </div>

      <button
        className={`mt-2 md:mt-4 text-lg md:text-xl project-page-title-info ${styles.projectPageTitleInfo}`}
        onClick={() => setIsInfoActive((prev) => !prev)}
      >
        <Reveal>{isInfoActive ? 'Info -' : 'Info +'}</Reveal>
      </button>

      <div className={` space-y-6 ${styles.projectPage}`}>
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
