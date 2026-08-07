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
  moreProjects: ProjectPayload[]
  encodeDataAttribute?: EncodeDataAttributeCallback
}

const STATUS_LABELS: Record<string, string> = {
  'completed': 'Completed',
  'in-progress': 'In Progress',
  'concept': 'Concept',
}

// Pull every caption out of the content array, in document order,
// across both single and double hybrid-media blocks.
function getFigures(content: any[] = []) {
  const figures: { caption: string }[] = []

  content?.forEach((block) => {
    if (block._type === 'hybridMedia' && block.caption) {
      figures.push({ caption: block.caption })
    }
    if (block._type === 'twoHybridMedia') {
      if (block.mediaOne?.caption) figures.push({ caption: block.mediaOne.caption })
      if (block.mediaTwo?.caption) figures.push({ caption: block.mediaTwo.caption })
    }
  })

  return figures
}

export function ProjectPage({
  data,
  moreProjects,
  encodeDataAttribute,
}: ProjectPageProps) {
  const {
    year,
    overview,
    site,
    client,
    title,
    content,
    slug,
    status,
    size,
    location,
    projectType,
    architects,
  } = data ?? {}

  const projects = moreProjects || []
  const currentProjectIndex = projects.findIndex((project) => project.slug === slug)

  const prevProject = projects[currentProjectIndex - 1] || null
  const nextProject = projects[currentProjectIndex + 1] || null

  const figures = getFigures(content)

  const titleRef = useRef<HTMLDivElement>(null)
  const titleHeadingRef = useRef<HTMLDivElement>(null)

  const [isInfoActive, setIsInfoActive] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [shouldShowTitleBlock, setShouldShowTitleBlock] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY > 100
      setHasScrolled(scrolled)
    }

    window.addEventListener('scroll', onScroll)
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const visible = isInfoActive || !hasScrolled
    setShouldShowTitleBlock(visible)

    if (titleRef.current && shouldShowTitleBlock !== visible && !isAnimating) {
      setIsAnimating(true)

      const spans = titleRef.current.querySelectorAll('span')

      if (visible) {
        gsap.to(spans, {
          y: '0%',
          opacity: 1,
          duration: 0.4,
          ease: 'power3.out',
          stagger: 0.01,
          onComplete: () => setIsAnimating(false),
        })
      } else {
        gsap.to(spans, {
          y: '-100%',
          opacity: 0,
          duration: 0.6,
          ease: 'power3.in',
          stagger: 0.01,
          onComplete: () => setIsAnimating(false),
        })
      }
    }
  }, [isInfoActive, hasScrolled, shouldShowTitleBlock])

  useEffect(() => {
    const storedInfoState = localStorage.getItem('infoActive')
    setIsInfoActive(storedInfoState ? storedInfoState === 'true' : true)
  }, [slug])

  useEffect(() => {
    localStorage.setItem('infoActive', isInfoActive.toString())
  }, [isInfoActive])

  return (
    <div className={`${isInfoActive ? `${styles.infoActive} info-active` : `${styles.infoInActive} info-inactive`}`}>
      <div className={` space-y-6 project-page-media ${styles.projectPage}`}>
        <div className='relative z-10 bg-white'>
          {content?.map((content, key) => (
            <RevealDiv delay={0.4} key={key}>
              <Module content={content} isInfoActive={isInfoActive} />
            </RevealDiv>
          ))}
        </div>

        
      </div>

      <div ref={titleRef} className={`w-full lg:w-2/4 flex ${styles.projectPageTitle} project-page-title flex-col`}>
       

        <div className={`project-page-details ${styles.projectPageDetails}`}>
          <div className={`flex flex-col ${styles.projectPageDetailsInner}`}>
            {overview && (
            <div className={`flex flex-wrap justify-between flex-col md:flex-row project-page-details`}>
              <div className="w-full">
                <Reveal element={'div'} elementClass={''}>
                  <CustomPortableText value={overview} />
                </Reveal>

                {site && (
                  <div className="mt-3">
                    {site && (
                      <Link
                        target="_blank"
                        className=" break-words  underline"
                        href={site.url}
                      >
                        <Reveal element={'div'} elementClass={' break-words  underline'}>
                          {site.urltitle}
                        </Reveal>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

           <div ref={titleHeadingRef}>
          {title && (
            <Reveal element={'div'} elementClass={' break-words hyphens-auto'}>
              {title}
            </Reveal>
          )}
        </div>

          {/* Project meta: title, status, size, type, year, location, architect */}
          <div className={`project-page-meta `} style={{ marginTop: '1rem', marginBottom: '1rem', opacity: 0.6 }}>
            {client?.map((client, i) => (
              <span key={i}>
                {client.title}
                <br />
              </span>
            ))}

            <div>
              Status
              {status && <div>{STATUS_LABELS[status] ?? status}</div>}
            </div>
            
            <div>
              Size
              {size && <div>{size}</div>}
            </div>

            <div>
              Year
              {year && <div>{year}</div>}
            </div>
            
            <div>
              Location
              {location && <div>{location}</div>}
            </div>
          
            <div>
              Type
               {projectType?.length ? (
              <div>
                {projectType.map((t, i) => (
                  <span key={i}>
                    {t.title}
                    {i < projectType.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            ) : null}
            </div>

            <div>
              Architect
              {architects?.length ? (
              <div >
                {architects.map((a, i) => (
                  <span key={i}>
                    {a.title}
                    {i < architects.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            ) : null}
            </div>

            
          </div>
          </div>
          

          {/* Figure list: every image caption, prefixed Fig 1, Fig 2, etc */}
          {figures.length > 0 && (
            <div className="project-page-figures mt-4">
              {figures.map((fig, i) => (
                <div key={i} className=" opacity-60">
                  Fig. {i + 1} - {fig.caption}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`mt-2 md:mt-4 flex gap-4  project-page-title-info ${styles.projectPageTitleInfo}`}>
        <button onClick={() => setIsInfoActive(true)} style={{ opacity: isInfoActive ? 0.5 : 1 }}>
          <Reveal>View 1</Reveal>
        </button>
        <button onClick={() => setIsInfoActive(false)} style={{ opacity: !isInfoActive ? 0.5 : 1 }}>
          <Reveal>View 2</Reveal>
        </button>
      </div>

    </div>
  )
}

export default ProjectPage