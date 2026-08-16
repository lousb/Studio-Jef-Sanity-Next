import Image from 'next/image'

import { urlForImage } from '@/sanity/lib/utils'

interface ImageBoxProps {
  image?: {
    asset?: {
      _ref?: string
      _id?: string
      url?: string
      metadata?: {
        dimensions?: { width: number; height: number }
        lqip?: string
        palette?: { dominant?: { background?: string } }
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
}

const FALLBACK_COLOR = '#e7e5e2'

export default function SingleImage({
  image,
  alt = 'Cover image',
  size = '(min-width: 940px) 60vw, 100vw',
  classesWrapper,
  caption,
  previewImageUrl = image?.lqip ?? image?.asset?.metadata?.lqip,
  previewColor = image?.asset?.metadata?.palette?.dominant?.background,
  fallbackAspectRatio = '3 / 2',
}: ImageBoxProps) {
  const imageUrl = image?.asset?.url || (image && urlForImage(image as any)?.fit('max').auto('format').url())

  const dimensions = image?.asset?.metadata?.dimensions
  const aspectRatio = dimensions ? `${dimensions.width} / ${dimensions.height}` : fallbackAspectRatio

  return (
    <div>
      <div
        className={`w-full overflow-hidden relative ${classesWrapper || ''}`}
        style={{
          aspectRatio,
          backgroundColor: previewColor || FALLBACK_COLOR,
          backgroundImage: previewImageUrl ? `url(${previewImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {imageUrl && (
          <Image
            alt={alt}
            fill
            sizes={size}
            className="object-cover"
            style={{ cursor: 'pointer' }}
            src={imageUrl}
            placeholder={previewImageUrl ? 'blur' : 'empty'}
            blurDataURL={previewImageUrl}
          />
        )}
      </div>
      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}