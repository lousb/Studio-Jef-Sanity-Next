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
import { FigureHoverProvider, useFigureHover } from './FigureHoverContext'
import { InfiniteLoop } from '@/components/global/InfiniteLoop'
import { useLenis } from '@/components/global/LenisProvider'

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

// Outer component: sets up the provider, then hands off to the inner
// component so hooks like useFigureHover() have a provider above them.
export function ProjectPage(props: ProjectPageProps) {
  return (
    <FigureHoverProvider>
      <ProjectPageInner {...props} />
    </FigureHoverProvider>
  )
}

function ProjectPageInner({
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

  const { hoveredCaption } = useFigureHover()
  const lenis = useLenis()

  useEffect(() => {
  let cancelled = false
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let observer: ResizeObserver | null = null

  const forceTop = () => {
    if (cancelled) return
    if (lenis) {
      lenis.resize()
      lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo(0, 0)
    }
  }

  const watchAndPin = () => {
    if (cancelled) return
    forceTop()

    const target = document.documentElement
    let lastHeight = target.scrollHeight

    const scheduleStop = () => {
      if (settleTimer) clearTimeout(settleTimer)
      settleTimer = setTimeout(() => {
        observer?.disconnect()
      }, 500)
    }

    observer = new ResizeObserver(() => {
      if (cancelled) return
      const newHeight = target.scrollHeight
      if (newHeight !== lastHeight) {
        lastHeight = newHeight
        forceTop() // content grew/shrank (InfiniteLoop cloning, images loading) — re-pin
      }
      scheduleStop()
    })

    observer.observe(target)
    scheduleStop()
  }

  const anyDoc = document as any
  if (anyDoc.startViewTransition && anyDoc.__nextViewTransition) {
    anyDoc.__nextViewTransition.finished?.then(watchAndPin).catch(watchAndPin)
  } else {
    requestAnimationFrame(watchAndPin)
  }

  return () => {
    cancelled = true
    observer?.disconnect()
    if (settleTimer) clearTimeout(settleTimer)
  }
}, [slug, lenis])

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

  const TRANSITION_DELAY_MS = 200
  const TRANSITION_DURATION_MS = 800
  const TOTAL_MS = TRANSITION_DELAY_MS + TRANSITION_DURATION_MS + 100 // small buffer

  useEffect(() => {
    if (!lenis) return

    const blocks = Array.from(document.querySelectorAll('[data-media-block]'))
    if (!blocks.length) return

    // anchor = first block at or below viewport top
    const anchor = blocks.find((el) => el.getBoundingClientRect().bottom > 0)
    if (!anchor) return

    let prevTop = anchor.getBoundingClientRect().top
    const start = performance.now()

    const tick = () => {
      const elapsed = performance.now() - start

      const newTop = anchor.getBoundingClientRect().top
      const delta = newTop - prevTop
      if (delta !== 0) {
        lenis.scrollTo(lenis.scroll + delta, { immediate: true, force: true })
      }
      prevTop = anchor.getBoundingClientRect().top

      if (elapsed >= TOTAL_MS) {
        gsap.ticker.remove(tick)
      }
    }

    gsap.ticker.add(tick)

    return () => gsap.ticker.remove(tick)
  }, [isInfoActive, lenis])

  useEffect(() => {
  let cancelled = false

  const resetScroll = () => {
    if (cancelled) return
    if (lenis) {
      // New page content = new document height. Lenis is caching the
      // OLD page's limits until this runs, so scrollTo(0) before this
      // can get silently corrected back to an old-page position.
      lenis.resize()
      lenis.scrollTo(0, { immediate: true, force: true })
    } else {
      window.scrollTo(0, 0)
    }
  }

  // If a View Transition is in flight (client-side nav via next-view-transitions),
  // wait for it to finish before resetting — otherwise the transition's own
  // snapshot/restore can win the race against our scrollTo.
  const anyDoc = document as any
  if (anyDoc.startViewTransition && anyDoc.__nextViewTransition) {
    anyDoc.__nextViewTransition.finished?.then(resetScroll).catch(resetScroll)
  } else {
    // Fallback: still wait a frame for layout to settle post-mount.
    requestAnimationFrame(resetScroll)
  }

  return () => {
    cancelled = true
  }
}, [slug, lenis])

  return (
    <div className={`${isInfoActive ? `${styles.infoActive} info-active` : `${styles.infoInActive} info-inactive`}`}>
      <div className={` space-y-6 project-page-media ${styles.projectPage}`}>
        <div className='relative z-10 bg-white'>
          <InfiniteLoop> 
            {content?.map((content, key) => (
        
                <Module content={content} isInfoActive={isInfoActive} />
        
            ))}
          </InfiniteLoop>
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
                  <div>
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
              {figures.map((fig, i) => {
                return (
                  <div
                    key={i}
                    className={`${fig.caption === hoveredCaption ? styles.figureActive : 'opacity-60'}`}
                  >
                    Fig. {i + 1} - {fig.caption}
                  </div>
                )
              })}
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