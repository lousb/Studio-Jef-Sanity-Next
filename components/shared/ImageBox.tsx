'use client'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'

import { urlForImage } from '@/sanity/lib/utils'

interface ImageBoxProps {
  image?: { asset?: any; lqip?: any }
  alt?: string
  width?: number
  height?: number
  size?: string
  classesWrapper?: string
  caption?: string
  previewImageUrl?: any
  'data-sanity'?: string
}

export default function ImageBox({
  image,
  alt = 'Cover image',
  width = 3500,
  height = 2000,
  size = '(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw',
  classesWrapper,
  previewImageUrl = image?.lqip,
  ...props
}: ImageBoxProps) {
  const imageUrl =
    image && urlForImage(image)?.height(height).width(width).fit('crop').url()

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  })

  // Check if the image is an animated format (GIF or WebP)
  const isGif = imageUrl?.endsWith('.gif')
  const isAnimatedWebP = imageUrl?.endsWith('.webp') && imageUrl.includes('animation') // A heuristic to detect animated WebP

  return (
    <div
      className={`w-full h-full overflow-hidden rounded-[3px] ${classesWrapper}`}
      data-sanity={props['data-sanity']}
    >
      {imageUrl && (
        isGif || isAnimatedWebP ? (
          // Use a regular <img> tag for animated WebPs and GIFs
          <img
            className="absolute w-full h-full"
            ref={ref}
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity 0.3s linear',
              objectFit: 'cover',
              width: '100%',
       
            }}
            alt={alt}
            src={imageUrl}
          />
        ) : (
          // Use next/image for static images (including static WebP)
          <Image
            className="absolute w-full h-full"
            ref={ref}
            style={{
              opacity: inView ? 1 : 0,
              transition: 'opacity 0.3s linear',
              objectFit: 'cover',
              width: '100%',
            
            }}
            alt={alt}
            width={width}
            height={height}
            sizes={size}
            src={imageUrl}
          />
        )
      )}
      <div className={`w-full overflow-hidden h-full`}>
        <Image
          width={width}
          height={height}
          src={previewImageUrl}
          style={{
            height: '100%',
          }}
          alt=""
          role="presentation"
        />
      </div>
    </div>
  )
}
