'use client'

import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import { gsap } from 'gsap'
import { Link } from 'next-view-transitions'
import { useEffect, useRef,useState } from 'react'
import { flushSync } from 'react-dom'

import { InfiniteLoop, type InfiniteLoopHandle } from '@/components/global/InfiniteLoop'
import { useLenis } from '@/components/global/LenisProvider'
import RevealDiv from '@/components/global/revealDiv'
import { Module } from '@/components/modules'
import { CustomPortableText } from '@/components/shared/CustomPortableText'
import type { ProjectPayload } from '@/types'
import type { HomePagePayload } from '@/types'

import Reveal from '../../global/Reveal'
import { FigureHoverProvider, useFigureHover } from './FigureHoverContext'
import styles from './ProjectPage.module.css'

function MobileDetailsOverlay({ open, onClick }: { open: boolean; onClick: () => void }) {
  const [shouldRender, setShouldRender] = useState(open)
  const elRef = useRef<HTMLDivElement | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const stateRef = useRef({ blur: 0, alpha: 0 })

  useEffect(() => {
    if (open) setShouldRender(true)
  }, [open])

  useEffect(() => {
    if (!shouldRender) return
    const el = elRef.current
    if (!el) return

    const state = stateRef.current
    const applyState = () => {
      el.style.setProperty('backdrop-filter', `blur(${state.blur}px)`)
      el.style.setProperty('-webkit-backdrop-filter', `blur(${state.blur}px)`)
      el.style.setProperty('background-color', `rgba(255, 255, 255, ${state.alpha})`)
    }

    tweenRef.current?.kill()

    tweenRef.current = open
      ? gsap.to(state, { blur: 40, alpha: 0.01, duration: 0.45, ease: 'linear', onUpdate: applyState })
      : gsap.to(state, {
          blur: 0,
          alpha: 0,
          duration: 0.4,
          ease: 'linear',
          onUpdate: applyState,
          onComplete: () => setShouldRender(false),
        })

    return () => {
      tweenRef.current?.kill()
    }
  }, [open, shouldRender])

  if (!shouldRender) return null

  return (
    <div
      ref={elRef}
      className="project-page-overlay is-visible"
      onClick={onClick}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 40 }}
      aria-hidden="true"
    />
  )
}

interface ProjectPageProps {
  data: ProjectPayload | null
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

  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false)
  const descRef = useRef<HTMLDivElement>(null)
  const descCopyRef = useRef<HTMLDivElement>(null)
  const [descOverflows, setDescOverflows] = useState(false)

  // Mobile info panel: the description sits in its own box from just under
  // the index / title / type / year row down to the View 1 / Close / View 2
  // row (the logo is hidden while it's open). Measured, so it fits any screen.
  useEffect(() => {
    if (!isMobileDetailsOpen) return
    const el = descRef.current
    if (!el) return

    const update = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight
      const visibleRects = (selector: string) =>
        Array.from(document.querySelectorAll(selector))
          .map((n) => n.getBoundingClientRect())
          .filter((r) => r.height > 0 && r.width > 0)
      // Anchor to the bottom of the stacked title block (index, title, type, year)
      const header = visibleRects('.title-heading')
      const rows = visibleRects('.project-page-title-info, .mobile-info-toggle')
      const headerBottom = header.length ? Math.max(...header.map((r) => r.bottom)) : 60
      const rowTop = rows.length ? Math.min(...rows.map((r) => r.top)) : vh - 60
      el.style.setProperty('--desc-top', `${Math.round(headerBottom)}px`)
      el.style.setProperty('--desc-bottom', `${Math.round(vh - rowTop)}px`)
      measureOverflow()
    }

    // Does the text fit? If not it gets the bottom fade + page-linked scroll.
    const measureOverflow = () => {
      const copy = descCopyRef.current
      if (!copy) return
      // Box height is fixed by top/bottom; compare against the resting space
      // (20px top + 20px bottom padding) so the extra bottom padding added
      // when overflowing can't flip the result back.
      setDescOverflows(copy.offsetHeight > el.clientHeight - 40 + 1)
    }

    const ro = new ResizeObserver(measureOverflow)
    ro.observe(el)
    if (descCopyRef.current) ro.observe(descCopyRef.current)

    update()
    const raf = requestAnimationFrame(update)
    const settle = setTimeout(update, 550) // logo margin transition is 500ms
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      clearTimeout(settle)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [isMobileDetailsOpen])

  // Desktop: when the description is taller than the space left above the
  // title + meta, it scrolls inside its own box (Lenis leaves wheel events
  // inside it alone via data-lenis-prevent) with a soft fade at whichever edge has more text.
  useEffect(() => {
    const el = descRef.current
    if (!el) return
    const mq = window.matchMedia('(min-width: 768px)')

    const update = () => {
      if (!mq.matches) {
        // Mobile keeps its own page-linked behaviour, so Lenis stays in charge
        el.removeAttribute('data-lenis-prevent')
        delete el.dataset.scrollable
        delete el.dataset.atStart
        delete el.dataset.atEnd
        return
      }
      const scrollable = el.scrollHeight > el.clientHeight + 1
      // Only take the wheel away from Lenis when there's something to scroll
      if (scrollable) el.setAttribute('data-lenis-prevent', '')
      else el.removeAttribute('data-lenis-prevent')
      el.dataset.scrollable = scrollable ? 'true' : 'false'
      el.dataset.atStart = el.scrollTop <= 1 ? 'true' : 'false'
      el.dataset.atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 ? 'true' : 'false'
    }

    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (descCopyRef.current) ro.observe(descCopyRef.current)
    el.addEventListener('scroll', update, { passive: true })
    mq.addEventListener('change', update)
    update()
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', update)
      mq.removeEventListener('change', update)
    }
  }, [slug])

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

  // Mobile info panel, text taller than its box: move it with the page
  // scroll (scroll down = text moves up), stopping at the first and last
  // line rather than looping.
  useEffect(() => {
    if (!isMobileDetailsOpen || !descOverflows) return
    const box = descRef.current
    const text = descCopyRef.current
    if (!box || !text) return

    let offset = 0
    let last = lenis ? lenis.scroll : window.scrollY
    const maxOffset = () => {
      const cs = getComputedStyle(box)
      const space = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      return Math.max(0, text.offsetHeight - space)
    }
    const apply = () => {
      text.style.transform = `translate3d(0, ${-offset}px, 0)`
      // Top fade only once the text has moved, so the first line is crisp at rest
      box.dataset.scrolled = offset > 0 ? 'true' : 'false'
    }

    const onScroll = (y: number) => {
      const delta = y - last
      last = y
      // InfiniteLoop teleports the page when it wraps; ignore those jumps
      if (Math.abs(delta) > window.innerHeight * 0.5) return
      offset = Math.min(maxOffset(), Math.max(0, offset + delta))
      apply()
    }

    apply()
    let cleanupScroll: () => void
    if (lenis) {
      cleanupScroll = lenis.on('scroll', (l: { scroll: number }) => onScroll(l.scroll))
    } else {
      const onWindowScroll = () => onScroll(window.scrollY)
      window.addEventListener('scroll', onWindowScroll, { passive: true })
      cleanupScroll = () => window.removeEventListener('scroll', onWindowScroll)
    }
    return () => {
      cleanupScroll()
      text.style.transform = ''
      delete box.dataset.scrolled
    }
  }, [isMobileDetailsOpen, descOverflows, lenis])

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
  }, [isInfoActive, hasScrolled, shouldShowTitleBlock, isAnimating])

  // Every visit starts on View 1. Once the visitor picks a view it carries
  // across projects for the rest of their visit (sessionStorage), then resets.
  useEffect(() => {
    try {
      localStorage.removeItem('infoActive') // clear the old forever-remembered choice
      const stored = sessionStorage.getItem('infoActive')
      setIsInfoActive(stored === null ? true : stored === 'true')
    } catch {
      setIsInfoActive(true)
    }
  }, [slug])

  useEffect(() => {
    try {
      sessionStorage.setItem('infoActive', isInfoActive.toString())
    } catch {
      // storage unavailable (private mode etc.) — view just won't carry over
    }
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

  // View 1 / View 2 toggle: shared-element morph + crossfade.
  // - The image nearest the middle of the screen (the anchor) stays where
  //   the eye is: the scroll is nudged so it doesn't move in the new layout,
  //   then it glides/scales from its old size to its new one (FLIP, transform
  //   only, so it's GPU-smooth; images keep their aspect so one scale is exact).
  // - Every other image on screen is left behind as a still copy that fades
  //   out in place, while the images in the new layout fade in. Nothing has
  //   to travel across the screen, so there's no "scrolling" feel.
  const handleSetIsInfoActive = (next: boolean) => {
    if (next === isInfoActive || isToggling.current) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const allBlocks = () =>
      Array.from(document.querySelectorAll('[data-media-block]')) as HTMLElement[]
    const before = getVisibleBlocks(allBlocks())

    if (reduceMotion || !before.length) {
      setIsInfoActive(next)
      return
    }

    isToggling.current = true
    gsap.killTweensOf(before)
    gsap.set(before, { clearProps: 'transform,opacity' })

    const vh = window.innerHeight
    const first = new Map<HTMLElement, DOMRect>()
    before.forEach((el) => first.set(el, el.getBoundingClientRect()))

    const anchor = before.reduce((best, el) => {
      const r = first.get(el)!
      const b = first.get(best)!
      const d = Math.abs(r.top + r.height / 2 - vh / 2)
      const db = Math.abs(b.top + b.height / 2 - vh / 2)
      return d < db ? el : best
    }, before[0])
    const anchorFirst = first.get(anchor)!

    // Still copies of the other on-screen images, to fade out in place.
    // They live in the gallery wrapper so they layer exactly like the
    // images (under the title / info / toggle).
    const media = document.querySelector('.project-page-media') as HTMLElement | null
    const ghostLayer = (media?.firstElementChild as HTMLElement | null) ?? null
    const ghosts: { el: HTMLElement; rect: DOMRect }[] = []
    if (ghostLayer) {
      before.forEach((el) => {
        if (el === anchor) return
        const g = el.cloneNode(true) as HTMLElement
        g.removeAttribute('data-media-block')
        g.setAttribute('aria-hidden', 'true')
        g.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'eager'))
        ghosts.push({ el: g, rect: first.get(el)! })
      })
    }

    // The page column's own CSS width transition would keep shifting the
    // centred images after we measure, so hold it still during the swap.
    const prevTransition = media?.style.transition ?? ''
    if (media) media.style.transition = 'none'

    infiniteLoopRef.current?.suspend()
    flushSync(() => setIsInfoActive(next))
    infiniteLoopRef.current?.resume() // re-measures the loop height synchronously

    // Keep the anchor where it was on screen. Use the real scroll position,
    // not Lenis's cached one.
    const delta = anchor.isConnected ? anchor.getBoundingClientRect().top - anchorFirst.top : 0
    if (Math.abs(delta) > 0.5) {
      const target = window.scrollY + delta
      if (lenis) {
        const l = lenis as typeof lenis & { __isProgrammaticJump?: boolean }
        l.__isProgrammaticJump = true
        lenis.resize()
        lenis.scrollTo(target, { immediate: true, force: true })
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            l.__isProgrammaticJump = false
          })
        )
      } else {
        window.scrollTo(0, target)
      }
    }

    // Place the still copies where the old images were (viewport coords
    // converted into the wrapper's coords, after the scroll nudge).
    if (ghostLayer && ghosts.length) {
      const base = ghostLayer.getBoundingClientRect()
      ghosts.forEach(({ el, rect }) => {
        Object.assign(el.style, {
          position: 'absolute',
          left: `${rect.left - base.left}px`,
          top: `${rect.top - base.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          margin: '0',
          transform: 'none',
          animation: 'none',
          pointerEvents: 'none',
          zIndex: '2',
        })
        ghostLayer.appendChild(el)
      })
    }

    const DURATION = 0.9
    const tl = gsap.timeline({
      onComplete: () => {
        ghosts.forEach(({ el }) => el.remove())
        if (media) media.style.transition = prevTransition
        isToggling.current = false
      },
    })
    tl.set({}, {}, DURATION) // fixed length, so onComplete always runs

    // Anchor morph (skip if something went wrong and it'd fly a long way)
    const last = anchor.isConnected ? anchor.getBoundingClientRect() : null
    const canMorph =
      last && last.width > 0 && Math.abs(anchorFirst.top - last.top) < vh * 0.5
    if (canMorph) {
      tl.fromTo(
        anchor,
        {
          x: anchorFirst.left - last!.left,
          y: anchorFirst.top - last!.top,
          scale: anchorFirst.width / last!.width,
          transformOrigin: '0 0',
          zIndex: 3,
          position: 'relative',
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          duration: DURATION,
          ease: 'power3.inOut',
          clearProps: 'transform,transformOrigin,zIndex,position',
        },
        0
      )
    }

    // Old copies fade out in place...
    if (ghosts.length) {
      tl.to(
        ghosts.map((g) => g.el),
        { opacity: 0, duration: 0.45, ease: 'power1.out' },
        0
      )
    }

    // ...while the new layout's images fade in
    const incoming = getVisibleBlocks(allBlocks()).filter((el) => !(canMorph && el === anchor))
    if (incoming.length) {
      tl.fromTo(
        incoming,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.05, clearProps: 'opacity' },
        0.2
      )
    }
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
              <div
                ref={descRef}
                data-overflow={descOverflows ? 'true' : 'false'}
                className={`flex flex-wrap justify-between flex-col md:flex-row project-page-details ${styles.projectPageDesc}`}
              >
                <div ref={descCopyRef} className="w-full">
                  <Reveal>
                    <CustomPortableText value={overview} />
                  </Reveal>

                  {site && (
                    <div className="mt-3">
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
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

            <div
              ref={titleHeadingRef}
              className={`${styles.titleHeading} text-list title-heading`}
              data-open={isMobileDetailsOpen ? 'true' : 'false'}
            >
              {customIndex !== undefined && customIndex !== null && (
                <Reveal element="div" elementClass="opacity-60">
                  {String(customIndex).padStart(3, '0')}
                </Reveal>
              )}
              {title && (
                <Reveal element={'h1'} elementClass={' break-words hyphens-auto'}>
                  {title}
                </Reveal>
              )}

              {/* Mobile only: type + year join the centred stack when the
                  information panel is open (desktop shows them in the meta list) */}
              {projectType?.length ? (
                <div className="title-stack-meta">
                  {projectType.map((t) => t.title).join(', ')}
                </div>
              ) : null}
              {year && <div className="title-stack-meta">{year}</div>}
            </div>

            {/* Project meta: title, status, size, type, year, location, architect */}
            <div className={`project-page-meta ${styles.projectPageMeta}`} style={{ marginTop: '20px', marginBottom: '1rem' }}>
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
          type="button"
          onClick={() => handleSetIsInfoActive(true)}
          aria-pressed={isInfoActive}
          className="view-toggle"
        >
          <Reveal>
            <span className="view-toggle-label">View 1</span>
          </Reveal>
        </button>
        <button
          type="button"
          onClick={() => handleSetIsInfoActive(false)}
          aria-pressed={!isInfoActive}
          className="view-toggle"
        >
          <Reveal>
            <span className="view-toggle-label">View 2</span>
          </Reveal>
        </button>
      </div>

      {/* Fullscreen black overlay, shown while the mobile details panel is open */}
      {/* Fullscreen blur overlay, shown while the mobile details panel is open */}
      <MobileDetailsOverlay open={isMobileDetailsOpen} onClick={() => setIsMobileDetailsOpen(false)} />

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