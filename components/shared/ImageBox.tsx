'use client'

import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { urlForImage } from '@/sanity/lib/utils'

interface ImageBoxProps {
  image?: {
    asset?: {
      _ref?: string
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
  const imageUrl = image?.asset?.url || urlForImage(image)?.fit('max').auto('format').url();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  const isGif = imageUrl?.endsWith('.gif')
  const isAnimatedWebP = imageUrl?.endsWith('.webp') && imageUrl.includes('animation')

  const metadata = image?.asset?.metadata?.dimensions
  const width = metadata?.width || 1000
  const height = metadata?.height || 1000

  return (
    <div
      className={`w-full overflow-hidden  ${classesWrapper}`}
      data-sanity={props['data-sanity']}
    >
      
      {imageUrl && (
        isGif || isAnimatedWebP ? (
          <img
            ref={ref}
            src={imageUrl}
            alt={alt}
            className="w-full h-auto object-cover"
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity 0.3s linear',
            }}
          />
        ) : (
          <Image
            ref={ref}
            src={imageUrl}
            alt={alt}
            width={width}
            height={height}
            sizes={size}
            className="w-full h-auto object-cover"
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity 0.3s linear',
            }}
          />
        )
      )}

      
    </div>
  )
}
