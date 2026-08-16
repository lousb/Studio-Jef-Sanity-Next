// components/pages/home/ProjectHoverPreview.tsx
"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ImageBox from '@/components/shared/ImageBox';
import { colsToWidth } from '@/lib/gridWidth';
import type { PreviewMediaBlock, PreviewMediaAsset } from '@/types';

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

export function ProjectHoverPreview({ images, active }: ProjectHoverPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll('[data-preview-item]');
    if (!items.length) return;

    if (active) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.12, ease: 'power3.out', overwrite: true }
      );
    } else {
      gsap.to(items, { opacity: 0, y: 12, duration: 0.25, ease: 'power3.in', stagger: 0.05, overwrite: true });
    }
  }, [active, images]);

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
        height: '100vh',
        overflowY: 'auto',
        pointerEvents: 'none', // never intercepts hover/click on the row underneath
        zIndex: 50,
        padding: '2rem 0',
      }}
      className="space-y-[10px]"
    >
      {images.map((img, i) => (
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