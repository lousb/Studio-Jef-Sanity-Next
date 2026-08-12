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
      }
    }
    lqip?: any
  }
  alt?: string
  size?: string
  classesWrapper?: string
  caption?: string
  previewImageUrl?: any
  'data-sanity'?: string
}

export default function ImageBox({
  image,
  alt = 'Cover image',
  size = '(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw',
  classesWrapper,
  previewImageUrl = image?.lqip,
  ...props
}: ImageBoxProps) {
  const imageUrl = image?.asset?.url || urlForImage(image as any)?.fit('max').auto('format').url();

  const [loaded, setLoaded] = useState(false)

  const isGif = imageUrl?.endsWith('.gif')
  const isAnimatedWebP = imageUrl?.endsWith('.webp') && imageUrl.includes('animation')

  const metadata = image?.asset?.metadata?.dimensions
  const width = metadata?.width || 1000
  const height = metadata?.height || 1000
  const aspectRatio = metadata ? `${width} / ${height}` : undefined

  return (
    <div
      className={`w-full overflow-hidden relative ${classesWrapper}`}
      data-sanity={props['data-sanity']}
      style={{
        aspectRatio,
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
            className="w-full h-full object-cover"
            onLoad={() => setLoaded(true)}
            
          />
        ) : (
          <Image
            src={imageUrl}
            alt={alt}
            width={width}
            height={height}
            sizes={size}
            className="w-full h-full object-cover"
            placeholder={previewImageUrl ? 'blur' : 'empty'}
            blurDataURL={previewImageUrl}
            onLoad={() => setLoaded(true)}
            
          />
        )
      )}
    </div>
  )
}