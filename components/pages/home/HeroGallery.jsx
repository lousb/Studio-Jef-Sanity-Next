'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { MuxPlayer } from '@mux/mux-player-react'
import ImageBox from '@/components/shared/ImageBox'
import ReactDOM from 'react-dom/client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'

import gsap from 'gsap'
import 'swiper/css'
import 'swiper/css/free-mode'

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
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Animation mode state with localStorage persistence
  const [infiniteXMode, setInfiniteXMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('heroGalleryMode');
      return saved ? JSON.parse(saved) : false; // Default to complex gallery
    }
    return false;
  });
  
  const desktopModeBeforeMobile = useRef(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('heroGalleryMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  }); // Initialize with saved state
  
  // Desktop state
  const scroll = useRef({
    ease: 0.06,
    current: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    delta: { x: { c: 0, t: 0 }, y: { c: 0, t: 0 } }
  })

  const viewport = useRef({
    scale: 1,
    targetScale: 1,
    ease: 0.05,
    baseScale: 1,
    minScale: 0.2,
    maxScale: 2
  })

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

  // Mobile state - simplified
  const mobileAnimation = useRef({
    scrollX: 0,
    speed: 0.5
  })

  const items = useRef([])
  const bounds = useRef({ w: 3000, h: 3000 })
  const winSize = useRef({ w: 0, h: 0 })
  const animationFrame = useRef(null)

  const [mediaItems, setMediaItems] = useState([])

  // Detect mobile and update responsive settings
  const updateResponsiveSettings = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const newIsMobile = width < 800 // Changed from 768 to 800

    // Only update if mobile state actually changed or first initialization
    if (newIsMobile !== isMobile || !isInitialized) {
      const wasMobile = isMobile;
      
      setIsMobile(newIsMobile)
      setIsInitialized(true)
      
      // Update window size
      winSize.current = { w: width, h: height }
      
      if (newIsMobile && !wasMobile) {
        // Going from desktop to mobile - save current state and force infinite X
        desktopModeBeforeMobile.current = infiniteXMode;
        setInfiniteXMode(true);
      } else if (!newIsMobile && wasMobile) {
        // Going from mobile to desktop - restore previous state
        setInfiniteXMode(desktopModeBeforeMobile.current);
      } else if (newIsMobile) {
        // Already mobile or first load on mobile - force infinite X mode
        setInfiniteXMode(true);
      }
      
      if (!newIsMobile) {
        // Desktop settings
        viewport.current.baseScale = 1
        viewport.current.scale = 1
        viewport.current.targetScale = 1
        viewport.current.ease = 0.05
        scroll.current.ease = 0.06
      }
      
      return true // Signal that settings changed
    }
    
    // Update window size even if mobile state didn't change
    winSize.current = { w: width, h: height }
    return false
  }, [isMobile, isInitialized, infiniteXMode])

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

  // Enhanced entrance animation
  const initGSAPTimeline = () => {
    if (entranceTimelineRef.current) entranceTimelineRef.current.kill()
    
    const container = containerRef.current
    if (!container) return

    entranceTimelineRef.current = gsap.timeline({ paused: true })

    const initialScale = isMobile ? 1.1 : 1.3
    const midScale = isMobile ? 1.05 : 1.2
    const finalScale = isMobile ? 1 : viewport.current.baseScale

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
        scale: finalScale,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.6')

    return entranceTimelineRef.current
  }

  // Desktop scroll handling
  const onScroll = useCallback(() => {
    if (isMobile || touch.current.preventScroll) return
    
    const progress = Math.min(window.scrollY / (window.innerHeight * 4), 1)
    const minScale = viewport.current.baseScale * 0.3
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

  // Desktop touch handlers
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = useCallback((e) => {
    if (isMobile) return // Mobile uses simple animation only
    
    const now = Date.now()
    const timeDiff = now - touch.current.lastTouchTime
    
    if (e.touches.length === 1) {
      const t = e.touches[0]
      
      if (timeDiff < 300 && timeDiff > 0) {
        touch.current.tapCount++
        if (touch.current.tapCount === 2) {
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
      
      const shouldPreventScroll = Math.abs(viewport.current.scale - viewport.current.baseScale) > 0.1
      touch.current.preventScroll = shouldPreventScroll
      
      if (!shouldPreventScroll) return
      
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
      e.preventDefault()
      touch.current.preventScroll = true
      touch.current.startDistance = getTouchDistance(e.touches)
      touch.current.startScale = viewport.current.targetScale
      
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      mouse.current.x.t = centerX / winSize.current.w
      mouse.current.y.t = centerY / winSize.current.h
    }
  }, [isMobile])

  const handleTouchMove = useCallback((e) => {
    if (isMobile || !touch.current.isActive) return
    
    if (e.touches.length === 1) {
      const t = e.touches[0]
      mouse.current.x.t = t.clientX / winSize.current.w
      mouse.current.y.t = t.clientY / winSize.current.h
      
      if (touch.current.preventScroll && isDragging.current) {
        e.preventDefault()
        const sensitivity = 0.8
        scroll.current.target.x = drag.current.scrollX + (t.clientX - drag.current.startX) * sensitivity
        scroll.current.target.y = drag.current.scrollY + (t.clientY - drag.current.startY) * sensitivity
      }
    } else if (e.touches.length === 2 && touch.current.startDistance > 0) {
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches)
      const scale = (currentDistance / touch.current.startDistance) * touch.current.startScale
      
      const minScale = viewport.current.baseScale * 0.2
      const maxScale = viewport.current.baseScale * 2
      
      viewport.current.targetScale = Math.max(minScale, Math.min(maxScale, scale))
      
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      mouse.current.x.t = centerX / winSize.current.w
      mouse.current.y.t = centerY / winSize.current.h
    }
  }, [isMobile])

  const handleTouchEnd = useCallback((e) => {
    if (isMobile) return
    
    if (e.touches.length === 0) {
      touch.current.isActive = false
      touch.current.preventScroll = false
      isDragging.current = false
      document.documentElement.classList.remove('dragging')
      mouse.current.press.t = 0
    } else if (e.touches.length === 1) {
      touch.current.startDistance = 0
      const t = e.touches[0]
      touch.current.startX = t.clientX
      touch.current.startY = t.clientY
    }
  }, [isMobile])

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

    // Create the title element (desktop only when not in infinite X mode)
    if (!isMobile && !infiniteXMode) {
      const titleEl = document.createElement('div');
      titleEl.textContent = item.title || 'Untitled';
      Object.assign(titleEl.style, {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        color: 'white',
        fontSize: '1rem',
        opacity: '0',
        transform: 'translateY(100%)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        zIndex: 10,
      });
      el.appendChild(titleEl);

      // GSAP animations for title on hover
      let isActive = false;

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
      };

      el.addEventListener('mouseenter', showTitle);
      el.addEventListener('mouseleave', hideTitle);
      
      el.cleanup = () => {
        el.removeEventListener('mouseenter', showTitle);
        el.removeEventListener('mouseleave', hideTitle);
      };
    } else {
      el.cleanup = () => {};
    }

    const processMedia = (width, height) => {
      const proposedRect = { x, y, w: width, h: height };

      if (items.current.some(existing => getOverlapPercent(proposedRect, existing))) return;

      // Spacing based on screen size and mode
      if (!isMobile && !infiniteXMode) {
        // Complex mode spacing logic
        const minHorizontalDistance = winSize.current.w * 1;
        const minVerticalDistance = winSize.current.h * 1;

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
      }

      Object.assign(el.style, { width: `${width}px`, height: `${height}px` });
      el.dataset.seed = seed;
      el.dataset.virtual = 'true';
      el.dataset.key = item.key;
      containerRef.current.appendChild(el);

      // Parallax only for desktop complex mode
      const parallaxIntensity = (isMobile || infiniteXMode) ? 0 : (0.8 + seededRandom(seed + 10) * 0.4);
      const depthLayer = seededRandom(seed + 15) > 0.5 ? 'front' : 'back';
      const parallaxFactorX = (isMobile || infiniteXMode) ? 0 : (depthLayer === 'front' ? parallaxIntensity * 1.5 : parallaxIntensity * 0.7);
      const parallaxFactorY = (isMobile || infiniteXMode) ? 0 : (depthLayer === 'front' ? parallaxIntensity * 1.2 : parallaxIntensity * 0.8);

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

    // Responsive sizing with natural aspect ratios
    const baseHeight = isMobile ? 200 + seededRandom(seed + 4) * 40 : 200 + seededRandom(seed + 4) * 40;

    if (item.type === 'video' && item.playbackId) {
      const aspectRatio = item.aspectRatio || 16 / 9;
      const h = baseHeight;
      const w = h * aspectRatio;

      const player = document.createElement('mux-player');
      player.className = 'hybrid-media';
      player.setAttribute('playbook-id', item.playbackId);
      player.setAttribute('stream-type', 'on-demand');
      player.setAttribute('muted', '');
      player.setAttribute('loop', '');
      player.setAttribute('preload', 'none');
      player.setAttribute('poster', `https://image.mux.com/${item.playbackId}/thumbnail.jpg?time=1`);
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

      // Intersection Observer with mobile optimization
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
        const h = baseHeight * (isMobile ? 1.4 : 1.5); // Increased mobile multiplier
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

  // Generate items based on device and mode
  const generateItems = useCallback(() => {
    const container = containerRef.current;
    if (!container || mediaItems.length === 0) return;

    container.innerHTML = '';
    items.current = [];

    // Always use simple horizontal layout for mobile OR when infinite X mode is active
    if (isMobile || infiniteXMode) {
      // Create Swiper for mobile, regular grid for desktop infinite X
      if (isMobile) {
        // Create Swiper container for mobile
        const swiperContainer = document.createElement('div');
        swiperContainer.className = 'swiper';
        swiperContainer.style.cssText = `
          width: 100%;
          height: 100vh;
          overflow: hidden;
        `;
        
        const swiperWrapper = document.createElement('div');
        swiperWrapper.className = 'swiper-wrapper';
        swiperWrapper.style.cssText = `
          align-items: center;
        `;
        
        mediaItems.forEach((item, index) => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';
          slide.style.cssText = `
            width: 280px !important;
            height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 40px;
          `;
          
          const mediaEl = document.createElement('div');
          mediaEl.style.cssText = `
            width: 280px;
            height: 200px;
            background: #000;
            opacity: 0.95;
            overflow: hidden;
            cursor: pointer;
          `;
          
          // Create media content
          if (item.type === 'video' && item.playbackId) {
            const player = document.createElement('mux-player');
            player.className = 'hybrid-media';
            player.setAttribute('playbook-id', item.playbackId);
            player.setAttribute('stream-type', 'on-demand');
            player.setAttribute('muted', '');
            player.setAttribute('loop', '');
            player.setAttribute('preload', 'none');
            player.setAttribute('poster', `https://image.mux.com/${item.playbackId}/thumbnail.jpg?time=1`);
            player.setAttribute('max-resolution', '240p');
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
            mediaEl.appendChild(link);

            // Intersection Observer
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) {
                  player.play().catch(() => {});
                } else {
                  player.pause();
                }
              },
              { threshold: 0.1 }
            );
            observer.observe(link);
            
          } else if (item.type === 'image' && item.asset?.url) {
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
            mediaEl.appendChild(link);
          }
          
          slide.appendChild(mediaEl);
          swiperWrapper.appendChild(slide);
        });
        
        swiperContainer.appendChild(swiperWrapper);
        container.appendChild(swiperContainer);
        
        // Initialize Swiper
        setTimeout(() => {
          import('swiper').then(({ default: Swiper }) => {
            new Swiper(swiperContainer, {
              modules: [FreeMode],
              slidesPerView: 'auto',
              spaceBetween: 40,
              freeMode: {
                enabled: true,
                sticky: false,
                momentumRatio: 0.25,
                momentumVelocityRatio: 0.25,
              },
              centeredSlides: false,
              loop: false,
              resistance: true,
              resistanceRatio: 0.25,
            });
          });
        }, 100);
        
      } else {
        // Desktop infinite X mode - locked 40px grid with natural aspect ratios
        const gap = 40; // Fixed 40px gap
        const baseHeight = 200 + Math.random() * 40; // Some variation like before
        
        let x = 0;
        const y = (winSize.current.h - baseHeight) / 2;

        // Create items with exact 40px spacing but natural aspect ratios
        const totalItems = mediaItems.length * 3; // Triple items for smooth infinite loop
        
        for (let i = 0; i < totalItems; i++) {
          const item = mediaItems[i % mediaItems.length];
          
          // Calculate width based on aspect ratio like in original code
          let itemWidth, itemHeight;
          
          if (item.type === 'video' && item.aspectRatio) {
            itemHeight = baseHeight;
            itemWidth = itemHeight * item.aspectRatio;
          } else {
            // Default or image - we'll determine size in createMediaElement
            itemHeight = baseHeight;
            itemWidth = itemHeight * (16 / 9); // Default aspect ratio
          }
          
          createMediaElement(item, i, x, y, gap);
          x += itemWidth + gap; // Exact 40px spacing between items
        }

        bounds.current.w = x - gap; // Remove last gap
        bounds.current.h = winSize.current.h;
      }
    } else {
      // Desktop: Complex grid system (only when not in infinite X mode)
      const gap = 40;
      const startX = 0;
      const startY = 0;

      let posY = startY;

      const baseHeight = 240;
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
    }
  }, [mediaItems, isMobile, infiniteXMode])

  // Mobile render function - simple horizontal scroll
  const renderMobile = useCallback(() => {
    mobileAnimation.current.scrollX += mobileAnimation.current.speed;
    
    for (const item of items.current) {
      const finalPosX = ((item.x - mobileAnimation.current.scrollX) % bounds.current.w);
      
      // Wrap around logic
      let wrappedX = finalPosX;
      if (wrappedX < -item.w) {
        wrappedX += bounds.current.w;
      }
      
      if (Math.abs(wrappedX - item.lastX) > 0.5) {
        item.el.style.transform = `translate(${wrappedX}px, ${item.y}px)`;
        item.lastX = wrappedX;
      }
    }

    animationFrame.current = requestAnimationFrame(renderMobile);
  }, [])

  // Desktop render function - complex interactions
  const renderDesktop = useCallback(() => {
    const s = scroll.current, m = mouse.current, v = viewport.current;
    
    v.scale += (v.targetScale - v.scale) * v.ease;
    
    s.current.x += (s.target.x - s.current.x) * s.ease;
    s.current.y += (s.target.y - s.current.y) * s.ease;
    s.delta.x.t = s.current.x - s.last.x;
    s.delta.y.t = s.current.y - s.last.y;
    s.delta.x.c += (s.delta.x.t - s.delta.x.c) * 0.04;
    s.delta.y.c += (s.delta.y.t - s.delta.y.c) * 0.04;
    
    m.x.c += (m.x.t - m.x.c) * 0.08;
    m.y.c += (m.y.t - m.y.c) * 0.08;
    m.press.c += (m.press.t - m.press.c) * 0.04;

    const gridW = bounds.current.w;
    const gridH = bounds.current.h;

    const parallaxStrength = 0.15;
    const mouseOffsetX = (m.x.c - 0.5) * winSize.current.w * parallaxStrength;
    const mouseOffsetY = (m.y.c - 0.5) * winSize.current.h * (parallaxStrength * 0.8);

    const viewportCenterX = winSize.current.w * 0.5;
    const viewportCenterY = winSize.current.h * 0.5;

    for (const item of items.current) {
      const parallaxX = mouseOffsetX * item.parallaxFactorX;
      const parallaxY = mouseOffsetY * item.parallaxFactorY;
      
      const velocityOffsetX = 8 * s.delta.x.c * item.ease;
      const velocityOffsetY = 8 * s.delta.y.c * item.ease;

      let posX = item.x + s.current.x + parallaxX + velocityOffsetX;
      let posY = item.y + s.current.y + parallaxY + velocityOffsetY;

      const scaledPosX = (posX - viewportCenterX) * v.scale + viewportCenterX;
      const scaledPosY = (posY - viewportCenterY) * v.scale + viewportCenterY;

      const finalPosX = ((scaledPosX + gridW / 2) % gridW) - gridW / 2;
      const finalPosY = ((scaledPosY + gridH / 2) % gridH) - gridH / 2;

      // Scaling effect
      const distanceFromCenter = Math.sqrt(
        Math.pow(m.x.c - 0.5, 2) + Math.pow(m.y.c - 0.5, 2)
      );
      const scaleEffect = v.scale * (1 + (item.depthLayer === 'front' ? distanceFromCenter * 0.02 : -distanceFromCenter * 0.01));

      if (Math.abs(finalPosX - item.lastX) > 0.5 || Math.abs(finalPosY - item.lastY) > 0.5) {
        item.el.style.transform = `translate(${finalPosX}px, ${finalPosY}px) scale(${scaleEffect})`;
        item.lastX = finalPosX;
        item.lastY = finalPosY;
      }
    }

    s.last.x = s.current.x;
    s.last.y = s.current.y;

    animationFrame.current = requestAnimationFrame(renderDesktop);
  }, [])

  // Main render function that switches based on device and mode
  const render = useCallback(() => {
    // Mobile uses Swiper, desktop infinite X uses animation, complex mode uses desktop render
    if (isMobile) {
      // Mobile uses Swiper - no animation loop needed
      return;
    } else if (infiniteXMode) {
      renderMobile(); // Use the simple horizontal animation for desktop infinite X
    } else {
      renderDesktop(); // Complex desktop interactions
    }
  }, [isMobile, infiniteXMode, renderMobile, renderDesktop])

  // Minimal resize handler - only update window size
  const handleResize = useCallback(
    debounce(() => {
      // Update responsive settings which may force mode changes
      const settingsChanged = updateResponsiveSettings();
      
      // If screen size changed significantly, regenerate items
      if (settingsChanged) {
        generateItems();
      }
    }, 100),
    [updateResponsiveSettings, generateItems]
  );

  // Desktop mouse handlers
  const handleMouseMove = useCallback(
    throttle((e) => {
      if (isMobile) return;
      
      mouse.current.x.t = e.clientX / winSize.current.w;
      mouse.current.y.t = e.clientY / winSize.current.h;
      
      if (isDragging.current) {
        scroll.current.target.x = drag.current.scrollX + (e.clientX - drag.current.startX);
        scroll.current.target.y = drag.current.scrollY + (e.clientY - drag.current.startY);
      }
    }, 16),
    [isMobile]
  );

  const handleWheel = useCallback((e) => {
    if (isMobile) return;
    
    e.preventDefault();
    const sensitivity = 0.4;
    scroll.current.target.x -= e.deltaX * sensitivity;
    scroll.current.target.y -= e.deltaY * sensitivity;
  }, [isMobile]);

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

  // Mode toggle handler with localStorage persistence
  const handleModeToggle = useCallback(() => {
    if (isMobile) return; // Don't allow toggle on mobile
    
    const newMode = !infiniteXMode;
    setInfiniteXMode(newMode);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('heroGalleryMode', JSON.stringify(newMode));
    }
  }, [isMobile, infiniteXMode]);

  // Main effect hook
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isInitialized) return;
    
    // Initialize responsive settings
    updateResponsiveSettings();
    generateItems();
    
    // Trigger entrance animation after items are generated
    const animationTimeout = setTimeout(() => {
      triggerEntranceAnimation();
    }, 100);
    
    // Event listeners - resize handling that may trigger regeneration
    window.addEventListener('resize', handleResize);
    
    // Desktop-only event listeners (only when not in infinite X mode)
    if (!isMobile && !infiniteXMode) {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mousedown', handleMouseDown);
      
      // Desktop touch events
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
    
    // Start render loop (only for non-mobile or desktop infinite X)
    if (!isMobile || infiniteXMode) {
      render();
    }
    
    return () => {
      clearTimeout(animationTimeout);
      
      // Clean up event listeners
      window.removeEventListener('resize', handleResize);
      
      if (!isMobile && !infiniteXMode) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleTouchEnd);
        
        if (container) {
          container.removeEventListener('mousedown', handleMouseDown);
          container.removeEventListener('touchstart', handleTouchStart);
          container.removeEventListener('touchmove', handleTouchMove);
        }
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
    };
  }, [
    mediaItems,
    isMobile,
    infiniteXMode,
    isInitialized,
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

  // Initialize on mount
  useEffect(() => {
    updateResponsiveSettings();
  }, [updateResponsiveSettings]);

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
          pointerEvents: isMobile ? 'auto' : ((infiniteXMode) ? 'none' : 'auto'), // Enable pointer events for mobile Swiper
          touchAction: isMobile ? 'pan-x pan-y' : ((infiniteXMode) ? 'pan-y' : (touch.current.preventScroll ? 'none' : 'pan-y')), // Allow swiper gestures on mobile
        }}
      />
      
      {/* Toggle button for desktop only (hidden on screens < 800px) */}
      {!isMobile && (
        <button
          onClick={handleModeToggle}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: infiniteXMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)',
            color: infiniteXMode ? '#000' : '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'all 0.3s ease',
            fontWeight: '500',
          }}
        >
          {infiniteXMode ? 'Interactive Mode' : 'Infinite Scroll'}
        </button>
      )}
      
      {/* Desktop zoom indicator (only in interactive mode) */}
      {!isMobile && !infiniteXMode && Math.abs(viewport.current.scale - viewport.current.baseScale) > 0.1 && (
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