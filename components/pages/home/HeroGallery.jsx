'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { MuxPlayer } from '@mux/mux-player-react'
import ImageBox from '@/components/shared/ImageBox'
import ReactDOM from 'react-dom/client'

import gsap from 'gsap'

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

// Simple debounce utility
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Simple throttle utility
function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const HeroGallery = ({ featuredMedia }) => {
  console.log('HeroGallery', featuredMedia)

  const containerRef = useRef(null)
  const entranceTimelineRef = useRef(null)
  const hasAnimated = useRef(false)
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(false)
  const [devicePixelRatio, setDevicePixelRatio] = useState(1)
  
  const scroll = useRef({
    ease: 0.06,
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    delta: { x: { c: 0, t: 0 }, y: { c: 0, t: 0 } }
  })

  // Enhanced viewport zoom state with mobile scaling
  const viewport = useRef({
    scale: 1,
    targetScale: 1,
    ease: 0.05,
    baseScale: 1, // Will be adjusted for mobile
    minScale: 0.2,
    maxScale: 2
  })

  // Touch handling
  const touch = useRef({
    isActive: false,
    startX: 0,
    startY: 0,
    startDistance: 0,
    startScale: 1,
    lastTouchTime: 0,
    tapCount: 0,
    preventScroll: false
  })

  const isDragging = useRef(false)
  const drag = useRef({ startX: 0, startY: 0, scrollX: 0, scrollY: 0 })
  const mouse = useRef({
    x: { t: 0.5, c: 0.5 },
    y: { t: 0.5, c: 0.5 },
    press: { t: 0, c: 0 }
  })

  const items = useRef([])
  const bounds = useRef({ w: 3000, h: 3000 })
  const winSize = useRef({ w: 0, h: 0 })
  const animationFrame = useRef(null)
  const resizeObserver = useRef(null)

  const [mediaItems, setMediaItems] = useState([])

  // Detect mobile and update responsive settings
  const updateResponsiveSettings = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const newIsMobile = width < 768 || (typeof window.orientation !== 'undefined')
    const dpr = window.devicePixelRatio || 1

    setIsMobile(newIsMobile)
    setDevicePixelRatio(dpr)
    
    // Update window size
    winSize.current = { w: width, h: height }
    
    // Adjust base scale for mobile to show more items
    if (newIsMobile) {
      viewport.current.baseScale = 0.67 // Show ~1.5x more items on mobile
      viewport.current.ease = 0.08 // Faster response on mobile
      scroll.current.ease = 0.08
    } else {
      viewport.current.baseScale = 1
      viewport.current.ease = 0.05
      scroll.current.ease = 0.06
    }

    // Reset viewport scale to base
    viewport.current.scale = viewport.current.baseScale
    viewport.current.targetScale = viewport.current.baseScale
  }, [])

  const extractGalleryItems = (featuredMedia) => {
    const extracted = []
    if (!Array.isArray(featuredMedia)) return extracted

    featuredMedia.forEach((project) => {
      const { slug, title } = project 

      if (!Array.isArray(project?.content)) return

      project.content.forEach((item) => {
        if (!item?._type) return
        const { _type, _key, caption } = item

        // hybridMedia block
        if (_type === 'hybridMedia' && item.featured) {
          const video = item.video?.asset
          const image = item.media?.asset

          if (video?.playbackId) {
            extracted.push({
              type: 'video',
              playbackId: video.playbackId,
              aspectRatio: video.data?.aspect_ratio || 16 / 9,
              key: _key,
              caption: caption || '',
              slug,
              title,
              linkUrl: `/projects/${slug || ''}`
            })
          } else if (image?.url) {
            extracted.push({
              type: 'image',
              asset: image,
              caption: caption || '',
              key: _key,
              slug,
              title,
              linkUrl: `/projects/${slug || ''}`
            })
          }
        }

        // twoHybridMedia block
        if (_type === 'twoHybridMedia') {
          if (item.leftFeatured && item.leftImage?.asset?.url) {
            const video = item.leftVideo?.asset
            const image = item.leftImage?.asset

            if (video?.playbackId) {
              extracted.push({
                type: 'video',
                playbackId: video.playbackId,
                aspectRatio: video.data?.aspect_ratio || 16 / 9,
                key: `${_key}-left`,
                caption: caption || '',
                slug,
                title,
                linkUrl: `/projects/${slug || ''}`
              })
            } else if (image?.url) {
              extracted.push({
                type: 'image',
                asset: image,
                caption: caption || '',
                key: `${_key}-left`,
                slug,
                title,
                linkUrl: `/projects/${slug || ''}`
              })
            }
          }

          if (item.rightFeatured && item.rightImage?.asset?.url) {
            const video = item.rightVideo?.asset
            const image = item.rightImage?.asset

            if (video?.playbackId) {
              extracted.push({
                type: 'video',
                playbackId: video.playbackId,
                aspectRatio: video.data?.aspect_ratio || 16 / 9,
                key: `${_key}-right`,
                caption: caption || '',
                slug,
                title,
                linkUrl: `/projects/${slug || ''}`
              })
            } else if (image?.url) {
              extracted.push({
                type: 'image',
                asset: image,
                caption: caption || '',
                key: `${_key}-right`,
                slug,
                title,
                linkUrl: `/projects/${slug || ''}`
              })
            }
          }
        }
      })
    })

    return extracted
  }

  // Enhanced entrance animation with mobile considerations
  const initGSAPTimeline = () => {
    if (entranceTimelineRef.current) entranceTimelineRef.current.kill()
    
    const container = containerRef.current
    if (!container) return

    entranceTimelineRef.current = gsap.timeline({ paused: true })

    // Adjust initial scale based on device
    const initialScale = isMobile ? 1.1 : 1.3
    const midScale = isMobile ? 1.05 : 1.2

    gsap.set(container, {
      scale: initialScale,
      opacity: 0,
      filter: 'blur(10px)'
    })

    entranceTimelineRef.current
      .to(container, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
      })
      .to(container, {
        scale: midScale,
        filter: 'blur(6px)',
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.3')
      .to(container, {
        scale: viewport.current.baseScale,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.6')

    return entranceTimelineRef.current
  }

  // Enhanced scroll handling with mobile considerations
  const onScroll = useCallback(() => {
    if (touch.current.preventScroll) return
    
    const progress = Math.min(window.scrollY / (window.innerHeight * (isMobile ? 2 : 4)), 1)
    
    // Adjust zoom range for mobile
    const minScale = isMobile ? viewport.current.baseScale * 0.5 : viewport.current.baseScale * 0.3
    const scaleRange = viewport.current.baseScale - minScale
    
    viewport.current.targetScale = viewport.current.baseScale - (progress * scaleRange)
  }, [isMobile])

  // Trigger entrance animation
  const triggerEntranceAnimation = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true
    
    const tl = initGSAPTimeline()
    if (tl) {
      tl.play()
    }
  }, [isMobile])

  // Touch distance calculation
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Enhanced touch handlers
  const handleTouchStart = useCallback((e) => {
    const now = Date.now()
    const timeDiff = now - touch.current.lastTouchTime
    
    if (e.touches.length === 1) {
      const t = e.touches[0]
      
      // Double tap detection
      if (timeDiff < 300 && timeDiff > 0) {
        touch.current.tapCount++
        if (touch.current.tapCount === 2) {
          // Double tap to reset zoom
          e.preventDefault()
          viewport.current.targetScale = viewport.current.baseScale
          touch.current.tapCount = 0
          return
        }
      } else {
        touch.current.tapCount = 1
      }
      
      touch.current.lastTouchTime = now
      touch.current.isActive = true
      touch.current.startX = t.clientX
      touch.current.startY = t.clientY
      
      // Determine if we should prevent page scroll
      const shouldPreventScroll = Math.abs(viewport.current.scale - viewport.current.baseScale) > 0.1
      touch.current.preventScroll = shouldPreventScroll
      
      if (!shouldPreventScroll) {
        // Allow normal page scrolling for small zoom levels
        return
      }
      
      isDragging.current = true
      document.documentElement.classList.add('dragging')
      Object.assign(drag.current, {
        startX: t.clientX,
        startY: t.clientY,
        scrollX: scroll.current.target.x,
        scrollY: scroll.current.target.y
      })
      mouse.current.press.t = 1
      
    } else if (e.touches.length === 2) {
      // Pinch zoom start
      e.preventDefault()
      touch.current.preventScroll = true
      touch.current.startDistance = getTouchDistance(e.touches)
      touch.current.startScale = viewport.current.targetScale
      
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      mouse.current.x.t = centerX / winSize.current.w
      mouse.current.y.t = centerY / winSize.current.h
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touch.current.isActive) return
    
    if (e.touches.length === 1) {
      const t = e.touches[0]
      mouse.current.x.t = t.clientX / winSize.current.w
      mouse.current.y.t = t.clientY / winSize.current.h
      
      if (touch.current.preventScroll && isDragging.current) {
        e.preventDefault()
        const sensitivity = isMobile ? 0.9 : 0.8
        scroll.current.target.x = drag.current.scrollX + (t.clientX - drag.current.startX) * sensitivity
        scroll.current.target.y = drag.current.scrollY + (t.clientY - drag.current.startY) * sensitivity
      }
    } else if (e.touches.length === 2 && touch.current.startDistance > 0) {
      // Pinch zoom
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      const scale = (currentDistance / touch.current.startDistance) * touch.current.startScale
      
      // Clamp scale with more generous bounds on mobile
      const minScale = isMobile ? viewport.current.baseScale * 0.3 : viewport.current.baseScale * 0.2
      const maxScale = isMobile ? viewport.current.baseScale * 3 : viewport.current.baseScale * 2
      
      viewport.current.targetScale = Math.max(minScale, Math.min(maxScale, scale))
      
      // Update center point for zoom
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      mouse.current.x.t = centerX / winSize.current.w
      mouse.current.y.t = centerY / winSize.current.h
    }
  }, [isMobile])

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      touch.current.isActive = false
      touch.current.preventScroll = false
      isDragging.current = false
      document.documentElement.classList.remove('dragging')
      mouse.current.press.t = 0
    } else if (e.touches.length === 1) {
      // Transition from pinch to single touch
      touch.current.startDistance = 0
      const t = e.touches[0]
      touch.current.startX = t.clientX
      touch.current.startY = t.clientY
    }
  }, [])

  useEffect(() => {
    const extracted = extractGalleryItems(featuredMedia)
    setMediaItems(extracted)
  }, [featuredMedia])

  const createMediaElement = (item, seed, x, y, spacing) => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      overflow: 'hidden',
      background: '#000',
      opacity: '0.95',
      display: 'block',
      cursor: 'pointer',
    });

    // Create the title element
    const titleEl = document.createElement('div');
    titleEl.textContent = item.title || 'Untitled';
    Object.assign(titleEl.style, {
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      color: 'white',
      fontSize: isMobile ? '0.875rem' : '1rem',
      opacity: '0',
      transform: 'translateY(100%)',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      zIndex: 10,
    });
    el.appendChild(titleEl);

    // GSAP animations for title on hover/touch
    let isActive = false;
    let rafId;

    const showTitle = () => {
      if (isActive) return;
      isActive = true;

      gsap.killTweensOf(titleEl);
      gsap.to(titleEl, {
        opacity: 1,
        y: '0%',
        duration: 0.4,
        ease: 'power1.out',
      });
    };

    const hideTitle = () => {
      if (!isActive) return;
      isActive = false;

      gsap.killTweensOf(titleEl);
      gsap.to(titleEl, {
        opacity: 0,
        y: '100%',
        duration: 0.4,
        ease: 'power2.out',
      });

      cancelAnimationFrame(rafId);
    };

    // Touch-friendly event listeners
    el.addEventListener('mouseenter', showTitle);
    el.addEventListener('mouseleave', hideTitle);
    el.addEventListener('touchstart', showTitle, { passive: true });
    el.addEventListener('touchend', hideTitle, { passive: true });
    
    el.cleanup = () => {
      el.removeEventListener('mouseenter', showTitle);
      el.removeEventListener('mouseleave', hideTitle);
      el.removeEventListener('touchstart', showTitle);
      el.removeEventListener('touchend', hideTitle);
      cancelAnimationFrame(rafId);
    };

    const processMedia = (width, height) => {
      const proposedRect = { x, y, w: width, h: height };

      if (items.current.some(existing => getOverlapPercent(proposedRect, existing))) return;

      // Adjust spacing thresholds for mobile
      const minHorizontalDistance = isMobile ? winSize.current.w * 0.8 : winSize.current.w * 1;
      const minVerticalDistance = isMobile ? winSize.current.h * 0.6 : winSize.current.h * 1;

      const proposedCenter = { cx: x + width / 2, cy: y + height / 2 };

      for (const existing of items.current) {
        if (!existing.el) continue;

        if (existing.el.dataset.key === item.key) {
          const existingCenter = {
            cx: existing.x + existing.w / 2,
            cy: existing.y + existing.h / 2,
          };

          const horizontalDist = Math.abs(proposedCenter.cx - existingCenter.cx);
          const verticalDist = Math.abs(proposedCenter.cy - existingCenter.cy);

          if (horizontalDist < minHorizontalDistance && verticalDist < minVerticalDistance) {
            return;
          }
        }
      }

      Object.assign(el.style, { width: `${width}px`, height: `${height}px` });
      el.dataset.seed = seed;
      el.dataset.virtual = 'true';
      el.dataset.key = item.key;
      containerRef.current.appendChild(el);

      // Enhanced parallax factors with mobile optimization
      const parallaxIntensity = (0.8 + seededRandom(seed + 10) * 0.4) * (isMobile ? 0.7 : 1);
      const depthLayer = seededRandom(seed + 15) > 0.5 ? 'front' : 'back';
      const parallaxFactorX = depthLayer === 'front' ? parallaxIntensity * 1.5 : parallaxIntensity * 0.7;
      const parallaxFactorY = depthLayer === 'front' ? parallaxIntensity * 1.2 : parallaxIntensity * 0.8;

      items.current.push({
        el,
        x,
        y,
        w: width,
        h: height,
        ease: seededRandom(seed + 6) * 0.5 + 0.5,
        rect: { width, height },
        lastX: 9999,
        lastY: 9999,
        parallaxFactorX,
        parallaxFactorY,
        depthLayer,
        baseScale: 1,
      });
    };

    // Responsive base height
    const baseHeight = isMobile ? 160 + seededRandom(seed + 4) * 30 : 200 + seededRandom(seed + 4) * 40;

    if (item.type === 'video' && item.playbackId) {
      const aspectRatio = item.aspectRatio || 16 / 9;
      const h = baseHeight;
      const w = h * aspectRatio;

      const player = document.createElement('mux-player');
      player.className = 'hybrid-media';
      player.setAttribute('playback-id', item.playbackId);
      player.setAttribute('stream-type', 'on-demand');
      player.setAttribute('muted', '');
      player.setAttribute('loop', '');
      player.setAttribute('preload', 'none');
      player.setAttribute('poster', `https://image.mux.com/${item.playbackId}/thumbnail.jpg?time=1`);
      // Lower quality for mobile to improve performance
      player.setAttribute('max-resolution', isMobile ? '240p' : '360p');
      Object.assign(player.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
      });

      const link = document.createElement('a');
      link.href = '/projects/' + (item.slug || '#');
      Object.assign(link.style, {
        display: 'block',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
      });

      link.appendChild(player);
      el.appendChild(link);

      // Intersection Observer with mobile-optimized thresholds
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            player.play().catch(() => {});
          } else {
            player.pause();
          }
        },
        { threshold: isMobile ? 0.1 : 0.25 }
      );
      observer.observe(link);

      processMedia(w, h);
    } else if (item.type === 'image' && item.asset?.url) {
      const img = new Image();
      img.src = item.asset.url;

      const handleReady = () => {
        const ratio = img.naturalWidth / img.naturalHeight || (16 / 9);
        const h = baseHeight * (isMobile ? 1.3 : 1.5);
        const w = h * ratio;

        const link = document.createElement('a');
        link.href = item.linkUrl || ('/projects/' + (item.slug || '#'));
        Object.assign(link.style, {
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          position: 'relative',
        });

        const imgEl = document.createElement('img');
        imgEl.src = item.asset.url;
        imgEl.alt = item.caption || 'Gallery Image';
        Object.assign(imgEl.style, {
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
        });

        link.appendChild(imgEl);
        el.appendChild(link);

        processMedia(w, h);
      };

      if (img.complete) handleReady();
      else img.onload = handleReady;
      img.onerror = () => {
        processMedia(baseHeight * 16 / 9, baseHeight);
      };
    }
  };

  // Enhanced grid generation with responsive parameters
  const generateItems = useCallback(() => {
    const container = containerRef.current;
    if (!container || mediaItems.length === 0) return;

    updateResponsiveSettings();
    container.innerHTML = '';
    items.current = [];

    const gap = isMobile ? 30 : 40;
    const startX = 0;
    const startY = 0;

    let posY = startY;

    // Responsive base dimensions
    const baseHeight = isMobile ? 180 : 240;
    const baseWidth = baseHeight * (16 / 9);

    const columns = Math.ceil(bounds.current.w / (baseWidth + gap)) + 2;
    const rows = Math.ceil(bounds.current.h / (baseHeight + gap)) + 2;

    let lastRowKeys = new Array(columns).fill(null);
    let twoRowsAgoKeys = new Array(columns).fill(null);

    let maxRowWidth = 0;

    for (let row = 0; row < rows; row++) {
      let posX = startX;
      let rowMaxHeight = 0;

      let lastKeyInRow = null;
      let twoItemsAgoInRow = null;

      for (let col = 0; col < columns; col++) {
        let itemIndex = (row * columns + col) % mediaItems.length;
        let item = mediaItems[itemIndex];

        let attempts = 0;
        while (attempts < mediaItems.length && (
          item.key === lastKeyInRow || 
          item.key === twoItemsAgoInRow ||
          item.key === lastRowKeys[col] || 
          item.key === twoRowsAgoKeys[col] ||
          (col > 0 && item.key === lastRowKeys[col - 1]) ||
          (col < columns - 1 && item.key === lastRowKeys[col + 1])
        )) {
          itemIndex = (itemIndex + 1) % mediaItems.length;
          item = mediaItems[itemIndex];
          attempts++;
        }

        createMediaElement(item, itemIndex, posX, posY, gap);

        twoItemsAgoInRow = lastKeyInRow;
        lastKeyInRow = item.key;

        posX += baseWidth + gap;
        rowMaxHeight = Math.max(rowMaxHeight, baseHeight);
      }

      twoRowsAgoKeys = [...lastRowKeys];
      lastRowKeys = new Array(columns);

      for (let col = 0; col < columns; col++) {
        const itemIndex = (row * columns + col) % mediaItems.length;
        lastRowKeys[col] = mediaItems[itemIndex].key;
      }

      posY += rowMaxHeight + gap;
      maxRowWidth = Math.max(maxRowWidth, posX);
    }

    bounds.current.w = maxRowWidth;
    bounds.current.h = posY;
  }, [mediaItems, isMobile]);

  // Enhanced render function with mobile optimizations
  const render = useCallback(() => {
    const s = scroll.current, m = mouse.current, v = viewport.current;
    
    // Smooth viewport scale transition
    v.scale += (v.targetScale - v.scale) * v.ease;
    
    s.current.x += (s.target.x - s.current.x) * s.ease;
    s.current.y += (s.target.y - s.current.y) * s.ease;
    s.delta.x.t = s.current.x - s.last.x;
    s.delta.y.t = s.current.y - s.last.y;
    s.delta.x.c += (s.delta.x.t - s.delta.x.c) * 0.04;
    s.delta.y.c += (s.delta.y.t - s.delta.y.c) * 0.04;
    
    // Responsive mouse tracking
    const mouseEase = isMobile ? 0.12 : 0.08;
    m.x.c += (m.x.t - m.x.c) * mouseEase;
    m.y.c += (m.y.t - m.y.c) * mouseEase;
    m.press.c += (m.press.t - m.press.c) * 0.04;

    const gridW = bounds.current.w;
    const gridH = bounds.current.h;

    // Enhanced mouse parallax with mobile adjustments
    const parallaxStrength = isMobile ? 0.08 : 0.15;
    const mouseOffsetX = (m.x.c - 0.5) * winSize.current.w * parallaxStrength;
    const mouseOffsetY = (m.y.c - 0.5) * winSize.current.h * (parallaxStrength * 0.8);

    const viewportCenterX = winSize.current.w * 0.5;
    const viewportCenterY = winSize.current.h * 0.5;

    for (const item of items.current) {
      const parallaxX = mouseOffsetX * item.parallaxFactorX;
      const parallaxY = mouseOffsetY * item.parallaxFactorY;
      
      // Reduced velocity effect on mobile for smoother performance
      const velocityMultiplier = isMobile ? 4 : 8;
      const velocityOffsetX = velocityMultiplier * s.delta.x.c * item.ease;
      const velocityOffsetY = velocityMultiplier * s.delta.y.c * item.ease;

      let posX = item.x + s.current.x + parallaxX + velocityOffsetX;
      let posY = item.y + s.current.y + parallaxY + velocityOffsetY;

      const scaledPosX = (posX - viewportCenterX) * v.scale + viewportCenterX;
      const scaledPosY = (posY - viewportCenterY) * v.scale + viewportCenterY;

      const finalPosX = ((scaledPosX + gridW / 2) % gridW) - gridW / 2;
      const finalPosY = ((scaledPosY + gridH / 2) % gridH) - gridH / 2;

      // Subtle scaling with reduced intensity on mobile
      const distanceFromCenter = Math.sqrt(
        Math.pow(m.x.c - 0.5, 2) + Math.pow(m.y.c - 0.5, 2)
      );
      const scaleIntensity = isMobile ? 0.01 : 0.02;
      const scaleEffect = v.scale * (1 + (item.depthLayer === 'front' ? distanceFromCenter * scaleIntensity : -distanceFromCenter * scaleIntensity * 0.5));

      // Use transform threshold to reduce unnecessary updates on mobile
      const threshold = isMobile ? 1 : 0.5;
      if (Math.abs(finalPosX - item.lastX) > threshold || Math.abs(finalPosY - item.lastY) > threshold) {
        item.el.style.transform = `translate(${finalPosX}px, ${finalPosY}px) scale(${scaleEffect})`;
        item.lastX = finalPosX;
        item.lastY = finalPosY;
      }
    }

    s.last.x = s.current.x;
    s.last.y = s.current.y;

    animationFrame.current = requestAnimationFrame(render);
  }, [isMobile]);

  // Optimized resize handler with proper debouncing
  const handleResize = useCallback(
    debounce(() => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      // Clean up existing items
      items.current.forEach(item => {
        if (item.el && item.el.cleanup) {
          item.el.cleanup();
        }
      });
      
      updateResponsiveSettings();
      generateItems();
      
      // Restart render loop
      render();
    }, 100),
    [generateItems, render]
  );

  // Throttled mouse move for better performance
  const handleMouseMove = useCallback(
    throttle((e) => {
      mouse.current.x.t = e.clientX / winSize.current.w;
      mouse.current.y.t = e.clientY / winSize.current.h;
      
      if (isDragging.current && !isMobile) {
        scroll.current.target.x = drag.current.scrollX + (e.clientX - drag.current.startX);
        scroll.current.target.y = drag.current.scrollY + (e.clientY - drag.current.startY);
      }
    }, isMobile ? 32 : 16), // Lower frequency on mobile
    [isMobile]
  );

  // Enhanced wheel handler with mobile detection
  const handleWheel = useCallback((e) => {
    if (isMobile) return; // Disable wheel events on mobile
    
    e.preventDefault();
    const sensitivity = 0.4;
    scroll.current.target.x -= e.deltaX * sensitivity;
    scroll.current.target.y -= e.deltaY * sensitivity;
  }, [isMobile]);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e) => {
    if (isMobile) return;
    
    isDragging.current = true;
    document.documentElement.classList.add('dragging');
    Object.assign(drag.current, {
      startX: e.clientX,
      startY: e.clientY,
      scrollX: scroll.current.target.x,
      scrollY: scroll.current.target.y
    });
    mouse.current.press.t = 1;
  }, [isMobile]);

  const handleMouseUp = useCallback(() => {
    if (isMobile) return;
    
    isDragging.current = false;
    document.documentElement.classList.remove('dragging');
    mouse.current.press.t = 0;
  }, [isMobile]);

  // Main effect hook
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Initialize responsive settings
    updateResponsiveSettings();
    generateItems();
    
    // Trigger entrance animation after items are generated
    const animationTimeout = setTimeout(() => {
      triggerEntranceAnimation();
    }, 100);
    
    // Event listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    if (!isMobile) {
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mousedown', handleMouseDown);
    }
    
    // Touch events for mobile
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Start render loop
    render();
    
    return () => {
      clearTimeout(animationTimeout);
      
      // Clean up event listeners
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      
      if (container) {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
      }
      
      // Clean up animations and timers
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      if (entranceTimelineRef.current) {
        entranceTimelineRef.current.kill();
      }
      
      // Clean up items
      items.current.forEach(item => {
        if (item.el && item.el.cleanup) {
          item.el.cleanup();
        }
      });
      
      // Clean up resize observer if it exists
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [
    mediaItems,
    isMobile,
    generateItems,
    render,
    triggerEntranceAnimation,
    onScroll,
    handleResize,
    handleWheel,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    updateResponsiveSettings
  ]);

  return (
    <>
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
          pointerEvents: 'auto',
          touchAction: touch.current.preventScroll ? 'none' : 'pan-y', // Allow vertical scrolling when not zoomed
        }}
      />
      
      {/* Mobile zoom indicator */}
      {isMobile && Math.abs(viewport.current.scale - viewport.current.baseScale) > 0.1 && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            zIndex: 1000,
            pointerEvents: 'none',
            transition: 'opacity 0.3s ease',
          }}
        >
          Double tap to reset zoom
        </div>
      )}
    </>
  );
};

export default HeroGallery;