'use client'

import { type RefObject, useEffect } from 'react'

/**
 * Desktop: when a text box (the right-hand description on project and
 * studio pages) is taller than the space it's given, it scrolls inside its
 * own box. This keeps the box's data attributes in sync for the CSS in
 * ProjectPage.module.css (.projectPageDesc):
 *   data-scrollable  – text is longer than the box (shows the hover scrollbar)
 *   data-at-start / data-at-end – drives the top / bottom edge fades
 * and hands wheel events inside it to the browser instead of Lenis
 * (data-lenis-prevent), only while there's something to scroll.
 *
 * The scrollbar gutter is permanently reserved in CSS (scrollbar-gutter:
 * stable), so the text width never changes when the bar appears/disappears.
 * This hook only toggles attributes, never layout, so it can't feed back
 * into itself (that loop is what caused the flicker around 958–985px).
 * Below 768px it clears everything and leaves mobile behaviour alone.
 */
export function useScrollableText(
  boxRef: RefObject<HTMLElement>,
  contentRef?: RefObject<HTMLElement>,
  deps: unknown[] = []
) {
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const mq = window.matchMedia('(min-width: 768px)')
    let raf = 0

    const setAttr = (key: string, value: string) => {
      if (el.dataset[key] !== value) el.dataset[key] = value
    }

    const update = () => {
      raf = 0
      if (!mq.matches) {
        el.removeAttribute('data-lenis-prevent')
        delete el.dataset.scrollable
        delete el.dataset.atStart
        delete el.dataset.atEnd
        return
      }
      const scrollable = el.scrollHeight > el.clientHeight + 1
      if (scrollable) {
        if (!el.hasAttribute('data-lenis-prevent')) el.setAttribute('data-lenis-prevent', '')
      } else {
        el.removeAttribute('data-lenis-prevent')
      }
      setAttr('scrollable', scrollable ? 'true' : 'false')
      setAttr('atStart', el.scrollTop <= 1 ? 'true' : 'false')
      setAttr(
        'atEnd',
        el.scrollTop + el.clientHeight >= el.scrollHeight - 1 ? 'true' : 'false'
      )
    }

    // batch to one update per frame (resize + scroll can fire many times)
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    const ro = new ResizeObserver(schedule)
    ro.observe(el)
    if (contentRef?.current) ro.observe(contentRef.current)
    el.addEventListener('scroll', schedule, { passive: true })
    mq.addEventListener('change', schedule)
    update()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('scroll', schedule)
      mq.removeEventListener('change', schedule)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
