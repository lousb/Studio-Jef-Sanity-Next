'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const NAV_CLASS = 'is-navigating'
const SAFETY_TIMEOUT = 8000          // clears if nav never resolves (fetch error, cancelled, etc.)
const MIN_VISIBLE_AFTER_LOAD = 500  // keep the wait cursor up this long once the new page has landed

// Chrome only repaints the cursor icon on an actual pointer event — toggling
// a class alone does nothing until the mouse next moves. Dispatching a
// synthetic mousemove at the same spot forces an immediate repaint.
function forceCursorRepaint(x: number, y: number) {
  document.dispatchEvent(
    new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: x, clientY: y })
  )
}

export default function NavigationCursor() {
  const pathname = usePathname()
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPos = useRef({ x: 0, y: 0 })
  const isFirstRender = useRef(true)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // route actually landed — hold the wait cursor a beat longer, then release
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (safetyRef.current) clearTimeout(safetyRef.current)
    if (settleRef.current) clearTimeout(settleRef.current)
    settleRef.current = setTimeout(() => {
      document.documentElement.classList.remove(NAV_CLASS)
      forceCursorRepaint(lastPos.current.x, lastPos.current.y)
    }, MIN_VISIBLE_AFTER_LOAD)
  }, [pathname])

  useEffect(() => {
    const start = (x: number, y: number) => {
      document.documentElement.classList.add(NAV_CLASS)
      forceCursorRepaint(x, y)

      if (settleRef.current) clearTimeout(settleRef.current)
      if (safetyRef.current) clearTimeout(safetyRef.current)
      safetyRef.current = setTimeout(() => {
        document.documentElement.classList.remove(NAV_CLASS)
        forceCursorRepaint(lastPos.current.x, lastPos.current.y)
      }, SAFETY_TIMEOUT)
    }

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement)?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor || anchor.target === '_blank') return

      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }

      const isInternal = url.origin === window.location.origin
      const isSamePage =
        url.pathname === window.location.pathname && url.search === window.location.search

      if (isInternal && !isSamePage) start(e.clientX, e.clientY)
    }

    const onPopState = () => start(lastPos.current.x, lastPos.current.y)

    // capture: true — fires before Next's Link onClick intercepts the click
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)

    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
      if (safetyRef.current) clearTimeout(safetyRef.current)
      if (settleRef.current) clearTimeout(settleRef.current)
    }
  }, [])

  return null
}