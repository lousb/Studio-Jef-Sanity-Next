'use client'

import React, { useEffect, useRef } from 'react'

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
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
  if (overlapArea === 0) return 0

  const smallerArea = Math.min(rect1.w * rect1.h, rect2.w * rect2.h)
  return overlapArea / smallerArea
}

const HeroGallery = ({ images }) => {
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

  const generateItems = () => {
    const container = containerRef.current
    if (!container) return

    winSize.current.w = window.innerWidth
    winSize.current.h = window.innerHeight

    scroll.current.current = { x: 0, y: 0 }
    scroll.current.target = { x: 0, y: 0 }
    scroll.current.last = { x: 0, y: 0 }

    container.innerHTML = ''
    items.current = []

    const spacing = 250
    const countX = Math.floor(bounds.current.w / spacing)
    const countY = Math.floor(bounds.current.h / spacing)
    const imageCount = images.length
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

        const image = images[imageIndex % imageCount]
        imageIndex++

        const seedCopy = seed // for closure
        const img = new Image()
        img.src = image.src
        img.loading = 'lazy'
        img.style.width = '100%'
        img.style.height = '100%'
        img.style.objectFit = 'cover'
        img.style.display = 'block'

        const isGif = image.src.toLowerCase().endsWith('.gif')

        const processImage = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight
          const baseHeight = 140 + seededRandom(seedCopy + 4) * 40
          const baseWidth = baseHeight * aspectRatio

          const proposedRect = { x, y, w: baseWidth, h: baseHeight }

          let hasTooMuchOverlap = false
          for (const existing of items.current) {
            const existingRect = { x: existing.x, y: existing.y, w: existing.w, h: existing.h }
            if (getOverlapPercent(proposedRect, existingRect) > 0.05) {
              hasTooMuchOverlap = true
              break
            }
          }
          if (hasTooMuchOverlap) return // skip adding this item

          const el = document.createElement('div')
          el.classList.add('item')
          el.style.position = 'absolute'
          el.style.width = `${baseWidth}px`
          el.style.height = `${baseHeight}px`

          el.style.overflow = 'hidden'
          el.style.background = '#000'
          el.style.opacity = '0.95'

          el.appendChild(img)
          container.appendChild(el)

          items.current.push({
            el,
            x,
            y,
            w: baseWidth,
            h: baseHeight,
            ease: seededRandom(seedCopy + 6) * 0.5 + 0.5,
            rect: { width: baseWidth, height: baseHeight },
            lastX: 0,
            lastY: 0
          })
        }

        if (isGif) {
          img.onload = () => processImage()
          img.onerror = () => console.warn(`GIF failed to load: ${img.src}`)
        } else {
          img.decode()
            .then(() => processImage())
            .catch(() => console.warn(`Image failed to decode: ${img.src}`))
        }
      }
    }
  }

  const onWheel = e => {
    e.preventDefault()
    const factor = 0.4
    scroll.current.target.x -= e.deltaX * factor
    scroll.current.target.y -= e.deltaY * factor
  }

  const onMouseDown = e => {
    e.preventDefault()
    isDragging.current = true
    document.documentElement.classList.add('dragging')
    mouse.current.press.t = 1
    drag.current.startX = e.clientX
    drag.current.startY = e.clientY
    drag.current.scrollX = scroll.current.target.x
    drag.current.scrollY = scroll.current.target.y
  }

  const onMouseUp = () => {
    isDragging.current = false
    document.documentElement.classList.remove('dragging')
    mouse.current.press.t = 0
  }

  const onMouseMove = e => {
    mouse.current.x.t = e.clientX / winSize.current.w
    mouse.current.y.t = e.clientY / winSize.current.h

    if (isDragging.current) {
      const dx = e.clientX - drag.current.startX
      const dy = e.clientY - drag.current.startY
      scroll.current.target.x = drag.current.scrollX + dx
      scroll.current.target.y = drag.current.scrollY + dy
    }
  }

  const render = () => {
    scroll.current.current.x += (scroll.current.target.x - scroll.current.current.x) * scroll.current.ease
    scroll.current.current.y += (scroll.current.target.y - scroll.current.current.y) * scroll.current.ease

    scroll.current.delta.x.t = scroll.current.current.x - scroll.current.last.x
    scroll.current.delta.y.t = scroll.current.current.y - scroll.current.last.y
    scroll.current.delta.x.c += (scroll.current.delta.x.t - scroll.current.delta.x.c) * 0.04
    scroll.current.delta.y.c += (scroll.current.delta.y.t - scroll.current.delta.y.c) * 0.04
    mouse.current.x.c += (mouse.current.x.t - mouse.current.x.c) * 0.04
    mouse.current.y.c += (mouse.current.y.t - mouse.current.y.c) * 0.04
    mouse.current.press.c += (mouse.current.press.t - mouse.current.press.c) * 0.04

    const gridWidth = bounds.current.w
    const gridHeight = bounds.current.h

    items.current.forEach(item => {
      const newX = 5 * scroll.current.delta.x.c * item.ease + (mouse.current.x.c - 0.5) * item.rect.width * 0.6
      const newY = 5 * scroll.current.delta.y.c * item.ease + (mouse.current.y.c - 0.5) * item.rect.height * 0.6

      const scrollX = scroll.current.current.x
      const scrollY = scroll.current.current.y

      let posX = item.x + scrollX + newX
      let posY = item.y + scrollY + newY

      posX = ((posX % gridWidth) + gridWidth) % gridWidth - gridWidth / 2
      posY = ((posY % gridHeight) + gridHeight) % gridHeight - gridHeight / 2

      if (Math.abs(posX - item.lastX) > 0.5 || Math.abs(posY - item.lastY) > 0.5) {
        item.el.style.transform = `translate(${posX}px, ${posY}px)`
        item.lastX = posX
        item.lastY = posY
      }
    })

    scroll.current.last.x = scroll.current.current.x
    scroll.current.last.y = scroll.current.current.y

    animationFrame.current = requestAnimationFrame(render)
  }

  useEffect(() => {
    if (!containerRef.current) return

    generateItems()

    window.addEventListener('resize', generateItems)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mousemove', onMouseMove)
    containerRef.current.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    render()

    return () => {
      window.removeEventListener('resize', generateItems)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('mousemove', onMouseMove)
      if (containerRef.current) containerRef.current.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="infinite-grid-container"
      style={{
        overflow: 'hidden',
        position: 'absolute',
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
