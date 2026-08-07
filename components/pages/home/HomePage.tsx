import type { EncodeDataAttributeCallback } from '@sanity/react-loader'

import { Header } from '@/components/shared/Header'
import type { HomePagePayload } from '@/types'
import RevealDiv from '@/components/global/revealDiv'
import ImageBox from '@/components/shared/ImageBox'
import { colsToWidth, COLUMN_NUM_MAP } from '@/lib/gridWidth'

export interface HomePageProps {
  data: HomePagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function HomePage({ data, encodeDataAttribute }: HomePageProps) {
  const { overview = [], featuredMedia = [] } = data ?? {}

  return (
    <div className="space-y-6 home-page">
      <div className={`mobile-intersector`}></div>

      {overview && <Header description={overview} />}

      {/* Featured media — same width/alignment logic as project page View 2 */}
      {featuredMedia?.length > 0 && (
        <div className="home-featured-media space-y-6 bg-white">
          {featuredMedia.map((item, i) => {
            const block = item?.block
            if (!block?.image?.asset) return null

            const cols = block.width ? COLUMN_NUM_MAP[block.width] ?? 24 : 24
            const dimensions = block.image.asset.metadata?.dimensions
            const aspectRatio = dimensions
              ? `${dimensions.width} / ${dimensions.height}`
              : undefined

            return (
              <RevealDiv delay={0.2} key={item.mediaKey || i}>
                <div
                  className="hybrid-media"
                  style={{ width: colsToWidth(cols), marginLeft: 0, marginRight: 'auto' }}
                >
                  <div style={{ width: '100%', height: 'auto', aspectRatio }}>
                    <ImageBox
                      image={{
                        asset: block.image.asset,
                        lqip: block.image.asset.metadata?.lqip,
                      }}
                      alt={block.title || block.caption || 'Featured project image'}
                      caption={block.caption}
                    />
                  </div>
                  {block.title && (
                    <div className="hybrid-media-title text-sm opacity-60 mt-2">
                      {block.title}
                    </div>
                  )}
                </div>
              </RevealDiv>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HomePage