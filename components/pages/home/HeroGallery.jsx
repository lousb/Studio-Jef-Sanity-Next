'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MuxPlayer } from '@mux/mux-player-react'

function seededRandom(seed) {
  return (Math.sin(seed) * 10000) % 1
}

function getOverlapPercent(rect1, rect2) {
  const x_overlap = Math.max(
    0,
    Math.min(rect1.x + rect1.w, rect2.x + rect2.w) - Math.max(rect1.x, rect2.x)
  )
  const y_overlap = Math.max(
    0,
    Math.min(rect1.y + rect1.h, rect2.y + rect2.h) - Math.max(rect1.y, rect2.y)
  )
  const overlapArea = x_overlap * y_overlap
  return overlapArea ? overlapArea / Math.min(rect1.w * rect1.h, rect2.w * rect2.h) : 0
}

const HeroGallery = ({ featuredMedia }) => {
  const containerRef = useRef(null)
  const scroll = useRef({
    ease: 0.06,
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    delta: { x: { c: 0, t: 0 }, y: { c: 0, t: 0 } }
  })

  const isDragging = useRef(false)
  const drag = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 })
  const mouse = useRef({
    x: { t: 0.5, c: 0.5 },
    y: { t: 0.5, c: 0.5 },
    press: { t: 0, c: 0 }
  })

  const items = useRef([])
  const bounds = useRef({ w: 6000, h: 6000 })
  const winSize = useRef({ w: 0, h: 0 })
  const animationFrame = useRef(null)

  // Extract media items from featuredMedia prop (same logic as before)
  const extractGalleryItems = (featuredMedia) => {
    const extracted = []

    if (!Array.isArray(featuredMedia)) return extracted

    featuredMedia.forEach((project) => {
      if (!Array.isArray(project?.content)) return

      project.content.forEach((item) => {
        if (!item?._type) return

        const { _type, _key, caption } = item

        if (_type === 'hybridMedia' && item.featured) {
          const video = item.video?.asset
          const image = item.media?.asset

          if (video?.playbackId) {
            extracted.push({
              type: 'video',
              playbackId: video.playbackId,
              aspectRatio: video.data?.aspect_ratio || 16 / 9,
              key: _key,
              caption: caption || ''
            })
          } else if (image?.url) {
            extracted.push({
              type: 'image',
              src: image.url,
              caption: caption || '',
              key: _key
            })
          }
        }

        if (_type === 'twoHybridMedia') {
          if (item.leftFeatured) {
            const video = item.leftVideo?.asset
            const image = item.leftImage?.asset

            if (video?.playbackId) {
              extracted.push({
                type: 'video',
                playbackId: video.playbackId,
                aspectRatio: video.data?.aspect_ratio || 16 / 9,
                key: `${_key}-left`,
                caption: caption || ''
              })
            } else if (image?.url) {
              extracted.push({
                type: 'image',
                src: image.url,
                caption: caption || '',
                key: `${_key}-left`
              })
            }
          }

          if (item.rightFeatured) {
            const video = item.rightVideo?.asset
            const image = item.rightImage?.asset

            if (video?.playbackId) {
              extracted.push({
                type: 'video',
                playbackId: video.playbackId,
                aspectRatio: video.data?.aspect_ratio || 16 / 9,
                key: `${_key}-right`,
                caption: caption || ''
              })
            } else if (image?.url) {
              extracted.push({
                type: 'image',
                src: image.url,
                caption: caption || '',
                key: `${_key}-right`
              })
            }
          }
        }
      })
    })

    return extracted
  }

  // State to hold media items extracted from featuredMedia
  const [mediaItems, setMediaItems] = useState([])

  // Extract media items when featuredMedia changes
  useEffect(() => {
    const extracted = extractGalleryItems(featuredMedia)
    setMediaItems(extracted)
  }, [featuredMedia])

  // Generate the grid items based on mediaItems
  const generateItems = () => {
    const container = containerRef.current
    if (!container) return

    winSize.current = { w: window.innerWidth, h: window.innerHeight }

    Object.assign(scroll.current, {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      last: { x: 0, y: 0 }
    })

    container.innerHTML = ''
    items.current = []

    const spacing = 150
    const countX = Math.floor(bounds.current.w / spacing)
    const countY = Math.floor(bounds.current.h / spacing)
    const imageCount = mediaItems.length
    let imageIndex = 0

    for (let i = 0; i < countX; i++) {
      for (let j = 0; j < countY; j++) {
        const seed = i * 1000 + j
        const dropoutChance = 0.3 + 0.15 * Math.sin(i * 0.3) * Math.cos(j * 0.3)
        if (seededRandom(seed) < dropoutChance) continue

        const baseX = i * spacing
        const baseY = j * spacing
        const waveX = Math.sin(j * 0.5) * 40
        const waveY = Math.cos(i * 0.5) * 40
        const jitterX = (seededRandom(seed + 1) - 0.5) * 80
        const jitterY = (seededRandom(seed + 2) - 0.5) * 80

        const x = baseX + waveX + jitterX - bounds.current.w / 2
        const y = baseY + waveY + jitterY - bounds.current.h / 2

        const item = mediaItems[imageIndex++ % imageCount]
        if (!item) continue
        const isVideo = item.type === 'video'
        const isGif = item.src?.toLowerCase().endsWith('.gif')

        const el = document.createElement('div')

        Object.assign(el.style, {
          position: 'absolute',
          overflow: 'hidden',
          background: '#000',
          opacity: '0.95',
          display: 'block'
        })

        const processMedia = (width, height) => {
          const proposedRect = { x, y, w: width, h: height }
          if (items.current.some(existing => getOverlapPercent(proposedRect, existing))) return

          Object.assign(el.style, { width: `${width}px`, height: `${height}px` })
          container.appendChild(el)

          items.current.push({
            el,
            x,
            y,
            w: width,
            h: height,
            ease: seededRandom(seed + 6) * 0.5 + 0.5,
            rect: { width, height },
            lastX: 9999,
            lastY: 9999
          })
        }

        if (isVideo && item.playbackId) {
          const aspectRatio = item.aspectRatio || 16 / 9
          const h = 180 + seededRandom(seed + 4) * 40
          const w = h * aspectRatio
          el.innerHTML = `
            <mux-player
              playback-id="${item.playbackId}"
              stream-type="on-demand"
              autoplay
              muted
              loop
              style="width: 100%; height: 100%; object-fit: cover;"
            ></mux-player>`
          processMedia(w, h)
        } else {
          const img = new Image()
          img.src = item.src
          img.loading = 'lazy'
          Object.assign(img.style, {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          })

          const handleReady = () => {
            const ratio = img.naturalWidth / img.naturalHeight
            const h = 140 + seededRandom(seed + 4) * 40
            const w = h * ratio
            el.appendChild(img)
            processMedia(w, h)
          }

          if (isGif) img.onload = handleReady
          else if ('decode' in img) {
            requestIdleCallback(() => {
              img.decode().then(handleReady).catch(() => img.onload = handleReady)
            })
          } else {
            img.onload = handleReady
          }

        }
      }
    }
  }

  // Scroll and drag event handlers (same as original)
  const onWheel = (e) => {
    e.preventDefault()
    scroll.current.target.x -= e.deltaX * 0.4
    scroll.current.target.y -= e.deltaY * 0.4
  }

  const onMouseDown = (e) => {
    isDragging.current = true
    document.documentElement.classList.add('dragging')
    Object.assign(drag.current, {
      startX: e.clientX,
      startY: e.clientY,
      scrollX: scroll.current.target.x,
      scrollY: scroll.current.target.y,
      willChange: 'transform'
    })
    mouse.current.press.t = 1
  }

  const onMouseMove = (e) => {
    mouse.current.x.t = e.clientX / winSize.current.w
    mouse.current.y.t = e.clientY / winSize.current.h

    if (isDragging.current) {
      scroll.current.target.x = drag.current.scrollX + (e.clientX - drag.current.startX)
      scroll.current.target.y = drag.current.scrollY + (e.clientY - drag.current.startY)
    }
  }

  const onMouseUp = () => {
    isDragging.current = false
    document.documentElement.classList.remove('dragging')
    mouse.current.press.t = 0
  }

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    isDragging.current = true
    document.documentElement.classList.add('dragging')
    Object.assign(drag.current, {
      startX: t.clientX,
      startY: t.clientY,
      scrollX: scroll.current.target.x,
      scrollY: scroll.current.target.y
    })
    mouse.current.press.t = 1
  }

  const onTouchMove = (e) => {
    if (!isDragging.current || e.touches.length !== 1) return
    e.preventDefault()
    const t = e.touches[0]
    mouse.current.x.t = t.clientX / winSize.current.w
    mouse.current.y.t = t.clientY / winSize.current.h
    scroll.current.target.x = drag.current.scrollX + (t.clientX - drag.current.startX) * 0.8
    scroll.current.target.y = drag.current.scrollY + (t.clientY - drag.current.startY) * 0.8
  }

  const onTouchEnd = () => {
    isDragging.current = false
    document.documentElement.classList.remove('dragging')
    mouse.current.press.t = 0
  }

  // The render animation loop
  const render = () => {
    const s = scroll.current,
      m = mouse.current

    s.current.x += (s.target.x - s.current.x) * s.ease
    s.current.y += (s.target.y - s.current.y) * s.ease

    s.delta.x.t = s.current.x - s.last.x
    s.delta.y.t = s.current.y - s.last.y

    s.delta.x.c += (s.delta.x.t - s.delta.x.c) * 0.04
    s.delta.y.c += (s.delta.y.t - s.delta.y.c) * 0.04

    m.x.c += (m.x.t - m.x.c) * 0.04
    m.y.c += (m.y.t - m.y.c) * 0.04
    m.press.c += (m.press.t - m.press.c) * 0.04

    const gridW = bounds.current.w
    const gridH = bounds.current.h

    for (const item of items.current) {
      const offsetX = 5 * s.delta.x.c * item.ease + (m.x.c - 0.5) * item.rect.width * 0.6
      const offsetY = 5 * s.delta.y.c * item.ease + (m.y.c - 0.5) * item.rect.height * 0.6

      let posX = item.x + s.current.x + offsetX
      let posY = item.y + s.current.y + offsetY

      posX = ((posX % gridW) + gridW) % gridW - gridW / 2
      posY = ((posY % gridH) + gridH) % gridH - gridH / 2

      

      if (Math.abs(posX - item.lastX) > 0.5 || Math.abs(posY - item.lastY) > 0.5) {
        item.el.style.transform = `translate(${posX}px, ${posY}px)`
        item.lastX = posX
        item.lastY = posY
      }
    }

    s.last.x = s.current.x
    s.last.y = s.current.y

    animationFrame.current = requestAnimationFrame(render)
  }

  // Effect to generate grid and set event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    generateItems()

    let resizeTimeout
    const throttledResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationFrame.current)
        generateItems()
      }, 150)
    }


    window.addEventListener('resize', throttledResize)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('touchstart', onTouchStart, { passive: false })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)

    render()

    return () => {
      window.removeEventListener('resize', throttledResize)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchend', onTouchEnd)
      container.removeEventListener('mousedown', onMouseDown)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
  }, [mediaItems])

  return (
    <div
      ref={containerRef}
      className="infinite-grid-container"
      style={{
        overflow: 'hidden',
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        pointerEvents: 'auto'
      }}
    />
  )
}

export default HeroGallery
