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
  fallbackAspectRatio?: string
  'data-sanity'?: string
}

const FALLBACK_COLOR = '#e7e5e2'

export default function AboutImageBox({
  image,
  alt = 'About image',
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
  const aspectRatio = dimensions ? `${dimensions.width} / ${dimensions.height}` : fallbackAspectRatio

  return (
    <div
      className={`w-full overflow-hidden relative ${classesWrapper || ''}`}
      data-sanity={props['data-sanity']}
      style={{
        aspectRatio,
        backgroundColor: previewColor || FALLBACK_COLOR,
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
