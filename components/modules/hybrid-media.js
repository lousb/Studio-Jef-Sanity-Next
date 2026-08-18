import React from 'react';
import ImageBox from '../shared/ImageBox';
import { colsToWidth, COLUMN_NUM_MAP } from '@/lib/gridWidth';
import { useFigureHover } from '@/components/pages/project/FigureHoverContext'

const HybridMedia = ({ data, isInfoActive }) => {
  const { media, caption, title, width, featured } = data || {};
  const { setHoveredCaption } = useFigureHover();

  if (!media?.asset) return null;

  const cols = COLUMN_NUM_MAP[width] ?? 24;
  const mobileCols = Math.max(1, Math.round(cols / 3)); // 12→4, 18→6, 24→8

  const wrapperStyle = isInfoActive
  ? {
      width: colsToWidth(6),
      marginLeft: `calc((100% - ${colsToWidth(6)}) / 2)`,
      marginRight: `calc((100% - ${colsToWidth(6)}) / 2)`,
      '--hm-mobile-cols': mobileCols,
    }
  : {
      width: colsToWidth(cols),
      marginLeft: 0,
      marginRight: 0,
      '--hm-mobile-cols': mobileCols,
    };

  return (
    <div
      className="divider hybrid-media mb-[10px]"
      style={wrapperStyle}
      data-featured={featured || undefined}
      data-media-block
      data-info-active={isInfoActive ? 'true' : 'false'}
      onMouseEnter={() => caption && setHoveredCaption(caption)}
      onMouseLeave={() => caption && setHoveredCaption(null)}
    >
      <ImageBox
        image={{
          asset: media.asset,
          lqip: media.asset.metadata?.lqip,
        }}
        alt={title || caption || 'Project image'}
        caption={caption}
      />
      {title && (
        <div className="hybrid-media-title text-sm opacity-60 mt-2">
          {title}
        </div>
      )}
    </div>
  );
};

export default HybridMedia;