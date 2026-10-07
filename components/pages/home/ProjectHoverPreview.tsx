// components/pages/home/ProjectHoverPreview.tsx
"use client";

import { gsap } from 'gsap';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import ImageBox from '@/components/shared/ImageBox';
import { colsToWidth } from '@/lib/gridWidth';
import type { PreviewMediaAsset,PreviewMediaBlock } from '@/types';

export interface FlatPreviewImage {
  asset: PreviewMediaAsset;
  caption?: string;
  title?: string;
}

// Flattens hybridMedia (1 image) and twoHybridMedia (2 images) blocks,
// in document order, capped at `max` — mirrors getFigures()'s approach
// in ProjectPage for pulling data across both block shapes.
export function getPreviewImages(
  content: PreviewMediaBlock[] = [],
  max = 3
): FlatPreviewImage[] {
  const images: FlatPreviewImage[] = [];

  for (const block of content) {
    if (images.length >= max) break;

    if (block._type === 'hybridMedia' && block.media?.asset) {
      images.push({ asset: block.media.asset, caption: block.caption, title: block.title });
    }

    if (block._type === 'twoHybridMedia') {
      if (block.mediaOne?.media?.asset) {
        images.push({
          asset: block.mediaOne.media.asset,
          caption: block.mediaOne.caption,
          title: block.mediaOne.title,
        });
      }
      if (images.length < max && block.mediaTwo?.media?.asset) {
        images.push({
          asset: block.mediaTwo.media.asset,
          caption: block.mediaTwo.caption,
          title: block.mediaTwo.title,
        });
      }
    }
  }

  return images.slice(0, max);
}

interface ProjectHoverPreviewProps {
  images: FlatPreviewImage[];
  active: boolean;
}

// Layout constants, kept in sync with the inline styles below
const STACK_TOP = -15; // container top offset (px)
const STACK_PADDING_TOP = 32; // 2rem
const STACK_GAP = 10; // space-y-[10px]
const FALLBACK_RATIO = 3 / 4; // height / width when an image has no dimensions yet

/**
 * Fewest images (in order) whose stacked height runs past the bottom of the
 * screen, so the stack always fills the view without loading extras.
 */
function countToFillScreen(images: FlatPreviewImage[], width: number, viewportHeight: number) {
  if (!width) return Math.min(images.length, 3);
  let bottom = STACK_TOP + STACK_PADDING_TOP;
  for (let i = 0; i < images.length; i++) {
    const dims = images[i].asset.metadata?.dimensions;
    const ratio = dims?.width ? dims.height / dims.width : FALLBACK_RATIO;
    bottom += width * ratio;
    if (bottom >= viewportHeight) return i + 1;
    bottom += STACK_GAP;
  }
  return images.length;
}

export function ProjectHoverPreview({ images, active }: ProjectHoverPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(3);

  // Work out how many images this project needs to fill the screen (on
  // hover change and window resize), before paint so there's no flicker.
  useLayoutEffect(() => {
    const update = () => {
      const width = containerRef.current?.clientWidth ?? 0;
      setCount(countToFillScreen(images, width, window.innerHeight));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [images]);

  const visible = images.slice(0, count);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('[data-preview-item]');
    if (!items.length) return;

    if (active) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0, stagger: 0, ease: 'power3.out', overwrite: true }
      );
    } else {
      gsap.to(items, { opacity: 0, duration: 0, ease: 'power3.in', stagger: 0, overwrite: true });
    }
  }, [active, images, count]);

  if (!images.length) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: '-15px',
        left: '50%',
        transform: 'translateX(-50%)', // matches View 1's centered margin-auto behavior
        width: colsToWidth(6),
        // Exactly covers the screen (top is -15px, so +15px) and clips there:
        // the stack meets the bottom edge instead of stopping short, and it
        // can never make the page taller. A taller page adds a scrollbar,
        // which shifts the rows under the mouse and makes the hover flicker.
        height: `calc(100vh - ${STACK_TOP}px)`,
        overflow: 'hidden',
        pointerEvents: 'none', // never intercepts hover/click on the row underneath
        zIndex: 50,
        padding: '2rem 0',
      }}
      className="space-y-[10px]"
    >
      {visible.map((img, i) => (
        <div key={i} data-preview-item style={{ opacity: 0, width: '100%' }}>
          <ImageBox
            image={{ asset: img.asset, lqip: img.asset.metadata?.lqip }}
            alt={img.title || img.caption || 'Project preview image'}
            caption={img.caption}
          />
        </div>
      ))}
    </div>
  );
}