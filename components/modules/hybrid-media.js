import React from 'react';
import ImageBox from '../shared/ImageBox';
import { colsToWidth, COLUMN_NUM_MAP } from '@/lib/gridWidth';

const HybridMedia = ({ data, isInfoActive }) => {
  const { media, caption, title, width, featured } = data || {};

  if (!media?.asset) return null;

  const cols = COLUMN_NUM_MAP[width] ?? 24;
  const dimensions = media.asset.metadata?.dimensions;
  const aspectRatio = dimensions
    ? `${dimensions.width} / ${dimensions.height}`
    : undefined;

  const wrapperStyle = isInfoActive
    ? {
        width: colsToWidth(6),
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: 'width 0.6s cubic-bezier(0.65,0,0.35,1), margin 0.6s cubic-bezier(0.65,0,0.35,1)',
      }
    : {
        width: colsToWidth(cols),
        marginLeft: 0,
        marginRight: 'auto',
        transition: 'width 0.6s cubic-bezier(0.65,0,0.35,1), margin 0.6s cubic-bezier(0.65,0,0.35,1)',
      };

  return (
    <div
      className="divider mt-3 hybrid-media"
      style={wrapperStyle}
      data-featured={featured || undefined}
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