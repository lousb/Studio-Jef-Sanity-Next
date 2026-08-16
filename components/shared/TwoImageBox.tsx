import Image from 'next/image'

import { urlForImage } from '@/sanity/lib/utils'

interface SanityImage {
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

interface ImageBoxProps {
  leftImage?: SanityImage
  rightImage?: SanityImage
  alt?: string
  width?: number
  height?: number
  sizes?: string
  classesWrapper?: string
  caption?: string
  previewLeftImageUrl?: any
  previewRightImageUrl?: any
}

const FALLBACK_COLOR = '#e7e5e2'

function Pane({
  image,
  alt,
  width,
  height,
  sizes,
  classesWrapper,
  previewImageUrl,
}: {
  image?: SanityImage
  alt: string
  width: number
  height: number
  sizes: string
  classesWrapper?: string
  previewImageUrl?: any
}) {
  if (!image?.asset) return null

  const imageUrl = urlForImage(image as any)?.height(height).width(width).fit('crop').url()
  if (!imageUrl) return null

  const lqip = previewImageUrl ?? image?.lqip ?? image?.asset?.metadata?.lqip
  const previewColor = image?.asset?.metadata?.palette?.dominant?.background
  // We requested a hard crop to width/height above, so that ratio — not
  // the source asset's natural ratio — is exactly what will render. No
  // fallback needed: this is always correct, even before the image loads.
  const aspectRatio = `${width} / ${height}`

  return (
    <div
      className={`w-full overflow-hidden relative ${classesWrapper || ''}`}
      style={{
        aspectRatio,
        backgroundColor: previewColor || FALLBACK_COLOR,
        backgroundImage: lqip ? `url(${lqip})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Image
        className="object-cover cursor-pointer"
        alt={alt}
        fill
        sizes={sizes}
        src={imageUrl}
        placeholder={lqip ? 'blur' : 'empty'}
        blurDataURL={lqip}
      />
    </div>
  )
}

export default function TwoImageBox({
  leftImage,
  rightImage,
  alt = 'Project image',
  width = 3500,
  height = 2000,
  sizes = '(min-width: 1200px) 33vw, (min-width: 768px) 50vw, 100vw',
  classesWrapper,
  caption,
  previewLeftImageUrl,
  previewRightImageUrl,
}: ImageBoxProps) {
  return (
    <div>
      <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
        <Pane
          image={leftImage}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          classesWrapper={classesWrapper}
          previewImageUrl={previewLeftImageUrl}
        />
        <Pane
          image={rightImage}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          classesWrapper={classesWrapper}
          previewImageUrl={previewRightImageUrl}
        />
      </div>
      {caption && (
        <div className="mt-2 md:mt-4 text-lg md:text-2xl">{caption}</div>
      )}
    </div>
  )
}