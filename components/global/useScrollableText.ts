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
 * Below 768px it clears all of that and leaves mobile behaviour alone.
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

    const update = () => {
      if (!mq.matches) {
        el.removeAttribute('data-lenis-prevent')
        delete el.dataset.scrollable
        delete el.dataset.atStart
        delete el.dataset.atEnd
        return
      }
      const scrollable = el.scrollHeight > el.clientHeight + 1
      if (scrollable) el.setAttribute('data-lenis-prevent', '')
      else el.removeAttribute('data-lenis-prevent')
      el.dataset.scrollable = scrollable ? 'true' : 'false'
      el.dataset.atStart = el.scrollTop <= 1 ? 'true' : 'false'
      el.dataset.atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 ? 'true' : 'false'
    }

    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (contentRef?.current) ro.observe(contentRef.current)
    el.addEventListener('scroll', update, { passive: true })
    mq.addEventListener('change', update)
    update()
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', update)
      mq.removeEventListener('change', update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
