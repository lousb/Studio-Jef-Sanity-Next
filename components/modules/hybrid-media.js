import React, { useMemo, useRef } from 'react';
import ImageBox from '../shared/ImageBox';
import { colsToWidth, COLUMN_NUM_MAP } from '@/lib/gridWidth';
import { useFigureHover } from '@/components/pages/project/FigureHoverContext'

// True only for the very first script evaluation of a hard page load.
// Client-side (Next.js) navigations don't re-run this module, so the
// flag stays false and later mounts skip the entrance animation.
let isFirstPageLoad = true;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'load',
    () => {
      // covers max delay (0.6s) + duration (0.4s) for any late-mounting instances
      setTimeout(() => {
        isFirstPageLoad = false;
      }, 1200);
    },
    { once: true }
  );
}

const HybridMedia = ({ data, isInfoActive }) => {
  const { media, caption, title, width, featured } = data || {};
  const { setHoveredCaption } = useFigureHover();

  // capture once per mount so it can't flip mid-animation
  const shouldAnimateIn = useRef(isFirstPageLoad).current;
  const entranceDelay = useMemo(
    () => (shouldAnimateIn ? 0.1 + Math.random() * 0.5 : 0),
    [shouldAnimateIn]
  );

  if (!media?.asset) return null;

  const cols = COLUMN_NUM_MAP[width] ?? 24;
  const mobileCols = Math.max(1, Math.round(cols / 3)); // 12→4, 18→6, 24→8

  const effectiveCols = isInfoActive ? 6 : cols;
  const desktopVw = Math.min(100, Math.round((effectiveCols / 24) * 100));
  const mobileVw = Math.min(100, Math.round((mobileCols / 8) * 100));
  const imageSizes = `(min-width: 768px) ${desktopVw}vw, ${mobileVw}vw`;

  const baseWrapperStyle = isInfoActive
    ? {
        width: colsToWidth(6),
        marginLeft: `calc((100% - ${colsToWidth(6)}) / 2)`,
        marginRight: `calc((100% - ${colsToWidth(6)}) / 2)`,
      }
    : {
        width: colsToWidth(cols),
        marginLeft: 0,
        marginRight: 0,
      };

  const wrapperStyle = {
    ...baseWrapperStyle,
    '--hm-mobile-cols': mobileCols,
    ...(shouldAnimateIn && {
      animation: `hybrid-media-fade-in 0.4s ease-out ${entranceDelay}s both`,
    }),
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
        size={imageSizes}
      />
      {title && (
        <div className="hybrid-media-title text-sm opacity-60 mt-2">
          {title}
        </div>
      )}

      {shouldAnimateIn && (
        <style jsx>{`
          @keyframes hybrid-media-fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      )}
    </div>
  );
};

export default HybridMedia;