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

function MobileDetailsOverlay({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`project-page-overlay${visible ? ' is-visible' : ''}`}
      onClick={onClick}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 40 }}
      aria-hidden="true"
    />
  )
}

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

// Only animate blocks actually in or near the viewport — off-screen
// clones in the infinite gallery don't need to fade, keeping the toggle
// feeling instant regardless of how many blocks exist in total.
const VIEWPORT_MARGIN = 150
function getVisibleBlocks(blocks: HTMLElement[]) {
  const vh = window.innerHeight
  const vw = window.innerWidth
  return blocks.filter((el) => {
    const r = el.getBoundingClientRect()
    return (
      r.bottom > -VIEWPORT_MARGIN &&
      r.top < vh + VIEWPORT_MARGIN &&
      r.right > -VIEWPORT_MARGIN &&
      r.left < vw + VIEWPORT_MARGIN
    )
  })
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
  const figuresRef = useRef<HTMLDivElement>(null)
  const infiniteLoopRef = useRef<InfiniteLoopHandle>(null)
  const isToggling = useRef(false)

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
      const succeeded = infiniteLoopRef.current?.scrollToStart()
      if (!succeeded) {
        requestAnimationFrame(forceTop) // InfiniteLoop not ready yet — try again next frame
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

  // Figures list: coordinated stagger across the whole list — 0.03s between
  // items, no per-item fade duration and no upfront delay, so it reads as a
  // quick cascading step-reveal rather than a slow fade. clearProps hands
  // opacity back to CSS afterward so the existing hover-dim (opacity-30 /
  // figureActive) classes keep working once the reveal is done.
  useEffect(() => {
    if (!figuresRef.current) return
    const items = figuresRef.current.querySelectorAll('[data-figure-item]')
    if (!items.length) return

    gsap.fromTo(
      items,
      { opacity: 0 },
      { opacity: 1, duration: 0, delay: 0, stagger: 0.03, clearProps: 'opacity' }
    )
  }, [slug])

  // View 1 / View 2 toggle, fully sequenced and scoped to what's on
  // screen, with the width/margin change happening instantly (no CSS
  // transition on HybridMedia) so hidden time is kept to a minimum:
  // 1. Stagger-fade only the on-screen (or near-screen) gallery blocks
  //    to opacity 0.
  // 2. Once that fade finishes, flip isInfoActive — width/margin apply
  //    instantly on HybridMedia while the blocks are invisible.
  // 3. Wait one frame for that layout change to actually paint.
  // 4. Stagger-fade the blocks back to opacity 1 in their new position.
  const handleSetIsInfoActive = (next: boolean) => {
    if (next === isInfoActive || isToggling.current) return

    const allBlocks = Array.from(document.querySelectorAll('[data-media-block]')) as HTMLElement[]

    if (!allBlocks.length) {
      setIsInfoActive(next)
      return
    }

    const blocks = getVisibleBlocks(allBlocks)

    if (!blocks.length) {
      setIsInfoActive(next)
      return
    }

    isToggling.current = true
    gsap.killTweensOf(blocks)

    gsap.to(blocks, {
      opacity: 0,
      duration: 0.6,
      ease: 'power1.in',
      stagger: {
        each: 0.1,
        from: 'random',
      },
      onComplete: () => {
        infiniteLoopRef.current?.suspend()
        setIsInfoActive(next)

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            infiniteLoopRef.current?.resume()

            // Re-query instead of reusing `blocks`: suspend()/resume() on
            // InfiniteLoop can clone/regenerate the block nodes, so the
            // references captured before the toggle may now be detached
            // from the document — animating them would be a silent no-op.
            const freshBlocks = getVisibleBlocks(
              Array.from(document.querySelectorAll('[data-media-block]')) as HTMLElement[]
            )
            gsap.killTweensOf(freshBlocks)
            gsap.set(freshBlocks, { opacity: 0 })

            gsap.to(freshBlocks, {
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              stagger: { each: 0.2, from: 'random' },
              onComplete: () => {
                isToggling.current = false
              },
            })
          })
        })
      },
    })
  }

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
            {content?.map((block, i) => (
              <Module isHero={false} key={block._key ?? i} content={block} isInfoActive={isInfoActive} />
            ))}
          </InfiniteLoop>
        </div>
      </div>

      <div ref={titleRef} className={`w-full lg:w-2/4 flex ${styles.projectPageTitle} project-page-title flex-col`}>
        <div
          className={`project-page-details ${styles.projectPageDetails} ${styles.detailsPanel}`}
          data-mobile-open={isMobileDetailsOpen ? 'true' : 'false'}
        >
          <div className={`flex flex-col ${styles.projectPageDetailsInner}`}>
            {overview && (
              <div className={`flex flex-wrap justify-between flex-col md:flex-row project-page-details ${styles.projectPageDesc}`}>
                <div className="w-full">
                  <Reveal>
                    <CustomPortableText value={overview} />
                  </Reveal>

                  {site && (
                    <div className="mt-3">
                      <Link
                        target="_blank"
                        className=" break-words  underline"
                        href={site.url}
                      >
                        <Reveal element={'div'} elementClass={' break-words  underline'}>
                          {site.urltitle}
                        </Reveal>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={titleHeadingRef} className={`${styles.titleHeading} text-list title-heading`}>
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

              {status && (
                <div className='text-list'>
                  <Reveal>
                    Status
                    <div>{STATUS_LABELS[status] ?? status}</div>
                  </Reveal>
                </div>
              )}

              {size && (
                <div className='text-list'>
                  <Reveal>
                    Size
                    <div>{size}</div>
                  </Reveal>
                </div>
              )}

              {year && (
                <div className='text-list project-year'>
                  <Reveal>
                    <span className='project-year-title'>Year</span>
                    <div>{year}</div>
                  </Reveal>
                </div>
              )}

              {location && (
                <div className='text-list'>
                  <Reveal>
                    Location
                    <div>{location}</div>
                  </Reveal>
                </div>
              )}

              {projectType?.length ? (
                <div className='text-list project-type'>
                  <Reveal>
                    <span className='project-type-title'>Type</span>
                  </Reveal>
                  <div>
                    {projectType.map((t, i) => (
                      <Reveal key={i}>
                        <span>
                          {t.title}
                          {i < projectType.length - 1 ? ', ' : ''}
                        </span>
                      </Reveal>
                    ))}
                  </div>
                </div>
              ) : null}

              {architects?.length ? (
                <div className='text-list'>
                  <Reveal>Architect</Reveal>
                  <div>
                    {architects.map((a, i) => (
                      <Reveal key={i}>
                        <span>
                          {a.title}
                          {i < architects.length - 1 ? ', ' : ''}
                        </span>
                      </Reveal>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Figure list: every image caption, prefixed Fig 1, Fig 2, etc */}
          {figures.length > 0 && (
            <div ref={figuresRef} className={`project-page-figures mt-4 text-list ${styles.projectPageFigures}`}>
              {figures.map((fig, i) => (
                <div
                  key={i}
                  data-figure-item
                  className={`${fig.caption === hoveredCaption ? styles.figureActive : 'opacity-30'}`}
                  style={{ opacity: 0 }}
                >
                  Fig. {i + 1} - {fig.caption}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`mt-2 md:mt-4 flex gap-4 project-page-title-info ${styles.projectPageTitleInfo}`}>
        <button
          onClick={() => handleSetIsInfoActive(true)}
          disabled={isInfoActive}
          style={{
            opacity: isInfoActive ? 0.5 : 1,
            cursor: isInfoActive ? 'default' : 'pointer',
            pointerEvents: isInfoActive ? 'none' : 'auto',
          }}
        >
          <Reveal>View 1</Reveal>
        </button>
        <button
          onClick={() => handleSetIsInfoActive(false)}
          disabled={!isInfoActive}
          style={{
            opacity: !isInfoActive ? 0.5 : 1,
            cursor: !isInfoActive ? 'default' : 'pointer',
            pointerEvents: !isInfoActive ? 'none' : 'auto',
          }}
        >
          <Reveal>View 2</Reveal>
        </button>
      </div>

      {/* Fullscreen black overlay, shown while the mobile details panel is open */}
      {isMobileDetailsOpen && (
        <MobileDetailsOverlay onClick={() => setIsMobileDetailsOpen(false)} />
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