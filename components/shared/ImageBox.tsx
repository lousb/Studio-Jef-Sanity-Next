'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/utils'

interface ImageBoxProps {
  image?: {
    asset?: {
      _ref?: string
      _type?: 'reference'
      url?: string
      metadata?: {
        dimensions?: {
          width: number
          height: number
        }
        lqip?: string
        palette?: {
          dominant?: {
            background?: string
          }
        }
      }
    }
    lqip?: any
  }
  alt?: string
  size?: string
  classesWrapper?: string
  caption?: string
  previewImageUrl?: any
  previewColor?: string
  /** Used only when Sanity hasn't returned real dimensions yet — keeps the box from ever collapsing to 0 height. */
  fallbackAspectRatio?: string
  'data-sanity'?: string
}

// Neutral placeholder paint — only shows if this particular asset has no
// palette yet (e.g. metadata genuinely still processing). Dark enough on
// its own to never read as a blank/white flash.
const FALLBACK_COLOR = '#3f3d38'

// Sanity's palette.dominant.background can legitimately be very pale (a
// bright sky, a white studio backdrop) — fine as the actual photo, but as
// a solid loading-state fill it reads as "blank" rather than "loading".
// Clamp its lightness so the paint is always visibly a colour.
const MAX_LIGHTNESS = 55 // 0–100, HSL lightness ceiling

function clampLightness(hex?: string, maxLightness = MAX_LIGHTNESS): string | undefined {
  if (!hex) return hex
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!match) return hex

  const r = parseInt(match[1], 16) / 255
  const g = parseInt(match[2], 16) / 255
  const b = parseInt(match[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (l * 100 <= maxLightness) return hex // already dark enough, leave it untouched

  let h = 0
  let s = 0
  const d = max - min
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }

  return hslToHex(h, s, maxLightness / 100)
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export default function ImageBox({
  image,
  alt = 'Cover image',
  size = '(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw',
  classesWrapper,
  previewImageUrl = image?.lqip ?? image?.asset?.metadata?.lqip,
  previewColor = image?.asset?.metadata?.palette?.dominant?.background,
  fallbackAspectRatio = '4 / 3',
  ...props
}: ImageBoxProps) {
  const imageUrl = image?.asset?.url || urlForImage(image as any)?.fit('max').auto('format').url();

  const [loaded, setLoaded] = useState(false)

  const isGif = imageUrl?.endsWith('.gif')
  const isAnimatedWebP = imageUrl?.endsWith('.webp') && imageUrl.includes('animation')

  const dimensions = image?.asset?.metadata?.dimensions
  // Always reserve real space: true aspect ratio when we have it, a sane
  // fallback when we don't, so this box never collapses to 0px and nothing
  // jumps once the image (or its metadata) actually arrives.
  const aspectRatio = dimensions ? `${dimensions.width} / ${dimensions.height}` : fallbackAspectRatio
  const resolvedPreviewColor = clampLightness(previewColor) || FALLBACK_COLOR

  return (
    <div
      className={`w-full overflow-hidden relative ${classesWrapper || ''}`}
      data-sanity={props['data-sanity']}
      style={{
        aspectRatio,
        // Three-stage progressive load, all painted before any image byte
        // arrives: 1) dominant colour, lightness-clamped so it's never a
        // near-white flash (instant, no network) → 2) blurred LQIP (inlined
        // in the page payload) → 3) crossfade to the sharp image via
        // next/image's built-in blur placeholder below.
        backgroundColor: resolvedPreviewColor,
        backgroundImage: previewImageUrl ? `url(${previewImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {imageUrl && (
        isGif || isAnimatedWebP ? (
          <img
            src={imageUrl}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={() => setLoaded(true)}
            style={{
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.4s linear',
            }}
          />
        ) : (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes={size}
            className="object-cover"
            placeholder={previewImageUrl ? 'blur' : 'empty'}
            blurDataURL={previewImageUrl}
            onLoad={() => setLoaded(true)}
          />
        )
      )}
    </div>
  )
}