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
import { InfiniteLoop, type InfiniteLoopHandle } from '@/components/global/InfiniteLoop'
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
    customIndex,
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
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false)

  const figures = getFigures(content)

  const titleRef = useRef<HTMLDivElement>(null)
  const titleHeadingRef = useRef<HTMLDivElement>(null)
  const infiniteLoopRef = useRef<InfiniteLoopHandle>(null)

  const [isInfoActive, setIsInfoActive] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [shouldShowTitleBlock, setShouldShowTitleBlock] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const { hoveredCaption } = useFigureHover()
  const lenis = useLenis()

  // On page mount / navigation: pin scroll to top, re-pinning if content
  // height keeps changing (InfiniteLoop cloning in, images loading).
  useEffect(() => {
    let cancelled = false
    let settleTimer: ReturnType<typeof setTimeout> | null = null
    let observer: ResizeObserver | null = null

    const forceTop = () => {
      if (cancelled) return
      if (lenis) {
        lenis.resize()
        lenis.scrollTo(-80, { immediate: true, force: true })
      } else {
        window.scrollTo(-80, 0)
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

  // View 1 / View 2 toggle: HybridMedia blocks resize via a 1s CSS
  // transition (width/margin). That reflow is already smooth on its own
  // — the only thing we need to do is stop InfiniteLoop from ALSO trying
  // to compensate for the same resize (it has its own ResizeObserver on
  // the same content), then let it do one clean re-sync once the CSS
  // transition has actually finished.
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll('[data-media-block]')) as HTMLElement[]
    if (!blocks.length) return

    infiniteLoopRef.current?.suspend()

    let pending = blocks.length
    const onEnd = (e: TransitionEvent) => {
      if (!['width', 'margin-left', 'margin-right'].includes(e.propertyName)) return
      pending -= 1
      if (pending <= 0) finish()
    }
    blocks.forEach((el) => el.addEventListener('transitionend', onEnd as any))

    // Safety net in case a transitionend never fires (interrupted
    // transition, display swap, etc.) — matches the ~1s CSS duration
    // plus buffer, so we don't leave InfiniteLoop suspended forever.
    const safety = setTimeout(finish, 1400)

    let finished = false
    function finish() {
      if (finished) return
      finished = true
      blocks.forEach((el) => el.removeEventListener('transitionend', onEnd as any))
      clearTimeout(safety)
      infiniteLoopRef.current?.resume()
    }

    return () => finish()
  }, [isInfoActive])

  // On page navigation: reset scroll once the new content's real height
  // is in place (Lenis caches the old page's scroll limits until resize()
  // runs, so scrollTo(0) before that can get silently corrected back).
  useEffect(() => {
    let cancelled = false

    const resetScroll = () => {
      if (cancelled) return
      if (lenis) {
        lenis.resize()
        lenis.scrollTo(0, { immediate: true, force: true })
      } else {
        window.scrollTo(0, 0)
      }
    }

    const anyDoc = document as any
    if (anyDoc.startViewTransition && anyDoc.__nextViewTransition) {
      anyDoc.__nextViewTransition.finished?.then(resetScroll).catch(resetScroll)
    } else {
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
          <InfiniteLoop ref={infiniteLoopRef}>
            {content?.map((content, key) => (

                <Module content={content} isInfoActive={isInfoActive} />

            ))}
          </InfiniteLoop>
        </div>
      </div>

      <div ref={titleRef} className={`w-full lg:w-2/4 flex ${styles.projectPageTitle} project-page-title flex-col`}>
<div
  className={`project-page-details ${styles.projectPageDetails} ${styles.detailsPanel}`}
  data-mobile-open={isMobileDetailsOpen ? 'true' : 'false'}
>          <div className={`flex flex-col ${styles.projectPageDetailsInner}`}>
            {overview && (
              <div className={`flex flex-wrap justify-between flex-col md:flex-row project-page-details ${styles.projectPageDesc}` }>
                <div className="w-full">
                  <Reveal>
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

            <div ref={titleHeadingRef} className='text-list title-heading'>
              {customIndex !== undefined && customIndex !== null && (
                <Reveal element="div" elementClass="opacity-60">
                  {String(customIndex).padStart(3, '0')}
                </Reveal>
              )}
              {title && (
                <Reveal element={'div'} elementClass={' break-words hyphens-auto'}>
                  {title}
                </Reveal>
              )}
            </div>

            {/* Project meta: title, status, size, type, year, location, architect */}
            <div className={`project-page-meta ${styles.projectPageMeta}`} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              {client?.map((client, i) => (
                <span key={i}>
                  {client.title}
                  <br />
                </span>
              ))}

              <div className='text-list'>
                <Reveal>
                  Status
                {status && <div>{STATUS_LABELS[status] ?? status}</div>}
                </Reveal>
                
              </div>

              <div className='text-list'>
                <Reveal>
                  Size
                {size && <div>{size}</div>}
                </Reveal>
                
              </div>

              <div className='text-list project-year'>
                <Reveal>
                  <span className='project-year-title'>
                  Year
                  </span>
                  
                {year && <div>{year}</div>}
                </Reveal>
                
              </div>

              <div className='text-list'>
                <Reveal>
                  Location
                  {location && <div>{location}</div>}
                </Reveal>
              </div>

              <div className='text-list project-type'>
                <Reveal>
                  <span className='project-type-title'>
                    Type
                  </span>
                  </Reveal>
                {projectType?.length ? (
                  <div>
                    {projectType.map((t, i) => (
                      <Reveal>
                        <span key={i}>
                          {t.title}
                          {i < projectType.length - 1 ? ', ' : ''}
                        </span>
                      </Reveal>
                      
                    ))}
                  </div>
                ) : null}
              </div>

              <div className='text-list'>
                <Reveal>Architect</Reveal>
                {architects?.length ? (
                  <div>
                    {architects.map((a, i) => (
                      <Reveal>
                        <span key={i}>
                          {a.title}
                          {i < architects.length - 1 ? ', ' : ''}
                        </span>
                      </Reveal>
                      
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Figure list: every image caption, prefixed Fig 1, Fig 2, etc */}
          {figures.length > 0 && (
            <div className={`project-page-figures mt-4 text-list ${styles.projectPageFigures}`}>
              {figures.map((fig, i) => {
                return (
                  <div
                    key={i}
                    className={`${fig.caption === hoveredCaption ? styles.figureActive : 'opacity-30'}`}
                  >
                    <Reveal  staggerDelay={0.05}>
                      Fig. {i + 1} - {fig.caption}
                    </Reveal>
                    
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

      {/* Fullscreen black overlay, shown while the mobile details panel is open */}
      {isMobileDetailsOpen && (
        <div
        className='project-page-overlay'
          onClick={() => setIsMobileDetailsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
           
            zIndex: 40,
          }}
        />
      )}

      <button
        type="button"
        onClick={() => setIsMobileDetailsOpen((v) => !v)}
        className={`${styles.mobileInfoToggle} mobile-info-toggle`}
        
      >
        {isMobileDetailsOpen ? 'Close' : 'Information'}
      </button>
    </div>
  )
}

export default ProjectPage