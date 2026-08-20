'use client'

import { useState } from 'react'
import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import { Link } from 'next-view-transitions'

import { Header } from '@/components/shared/Header'
import type { HomePagePayload } from '@/types'
import RevealDiv from '@/components/global/revealDiv'
import ImageBox from '@/components/shared/ImageBox'
import { colsToWidth, COLUMN_NUM_MAP } from '@/lib/gridWidth'
import { InfiniteLoop } from '@/components/global/InfiniteLoop'
import { CursorLabel } from '@/components/global/CursorLabel'

export interface HomePageProps {
  data: HomePagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function HomePage({ data, encodeDataAttribute }: HomePageProps) {
  const { overview = [], featuredMedia = [] } = data ?? {}
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="space-y-6 home-page">
      <InfiniteLoop>
        <div className={`mobile-intersector`}></div>
    
          {overview && <Header description={overview} />}

          {/* Featured media — same width/alignment logic as project page View 2 */}
          {featuredMedia?.length > 0 && (
            <div className="home-featured-media space-y-6 bg-white">
              {featuredMedia.map((item, i) => {
                const block = item?.block
                if (!block?.image?.asset) return null

                const cols = block.width ? COLUMN_NUM_MAP[block.width] ?? 24 : 24

                // Tell next/image the REAL rendered width so it fetches a
                // source large enough for this box — without this, ImageBox
                // falls back to a 33vw assumption and full-width featured
                // media ends up visibly soft/pixelated.
                const desktopVw = Math.min(100, Math.round((cols / 24) * 100))
                const imageSizes = `(min-width: 768px) ${desktopVw}vw, 100vw`

                const href = item?.project?.slug?.current
                  ? `/projects/${item.project.slug.current}`
                  : null

                const mediaContent = (
                  <div
                    className="hybrid-media"
                    style={{ width: colsToWidth(cols), marginLeft: 0, marginRight: 'auto' }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <ImageBox
                      image={{
                        asset: block.image.asset,
                        lqip: block.image.asset.metadata?.lqip,
                      }}
                      alt={block.title || block.caption || 'Featured project image'}
                      caption={block.caption}
                      size={imageSizes}
                    />
                    {block.title && (
                      <div className="hybrid-media-title text-sm opacity-60 mt-2">
                        {block.title}
                      </div>
                    )}
                  </div>
                )

                return (
                  <div key={i}>
                    {href ? <Link href={href} className="block w-min">
                      {mediaContent}
                    </Link> : mediaContent}
                  </div>
                )
              })}
            </div>
          )}
      </InfiniteLoop>

      <CursorLabel
        text={hoveredIndex !== null ? featuredMedia[hoveredIndex]?.project?.title ?? '' : ''}
        active={hoveredIndex !== null}
      />
    </div>
  )
}

export default HomePage