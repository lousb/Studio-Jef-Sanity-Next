import React from 'react';
import ImageBox from '../shared/ImageBox';
import { colsToWidth, COLUMN_NUM_MAP } from '@/lib/gridWidth';
import { useFigureHover } from '@/components/pages/project/FigureHoverContext'

const EASE = 'cubic-bezier(0.32, 0, 0.15, 1)';

const HybridMedia = ({ data, isInfoActive }) => {
  const { media, caption, title, width, featured } = data || {};
  const { setHoveredCaption } = useFigureHover();

  if (!media?.asset) return null;

  const cols = COLUMN_NUM_MAP[width] ?? 24;
  const dimensions = media.asset.metadata?.dimensions;
  const aspectRatio = dimensions
    ? `${dimensions.width} / ${dimensions.height}`
    : undefined;

  const EASE = 'cubic-bezier(0.32, 0, 0.15, 1)';

  const wrapperStyle = isInfoActive
    ? {
        width: colsToWidth(6),
        marginLeft: `calc((100% - ${colsToWidth(6)}) / 2)`,
        marginRight: `calc((100% - ${colsToWidth(6)}) / 2)`,
        transition: `width 1s ${EASE}, margin 1s ${EASE}`,
      }
    : {
        width: colsToWidth(cols),
        marginLeft: 0,
        marginRight: 0,
        transition: `width 1s ${EASE}, margin 1s ${EASE}`,
      };

  return (
    <div
      className="divider hybrid-media mb-[10px]"
      style={wrapperStyle}
      data-featured={featured || undefined}
      data-media-block
      onMouseEnter={() => caption && setHoveredCaption(caption)}
      onMouseLeave={() => caption && setHoveredCaption(null)}
    >
      <div style={{ width: '100%', height: 'auto', aspectRatio }}>
        <ImageBox
          image={{
            asset: media.asset,
            lqip: media.asset.metadata?.lqip,
          }}
          alt={title || caption || 'Project image'}
          caption={caption}
        />
      </div>
      {title && (
        <div className="hybrid-media-title text-sm opacity-60 mt-2">
          {title}
        </div>
      )}
    </div>
  );
};

export default HybridMedia;