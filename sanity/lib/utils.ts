import createImageUrlBuilder from '@sanity/image-url'
import type { Image } from 'sanity'

import { dataset, projectId } from '@/sanity/lib/api'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlForImage = (source: Image | undefined) => {
  // Accept a raw reference (asset._ref), an already-dereferenced asset
  // (asset._id, from an `asset->{ ... }` GROQ projection), or an asset
  // that only carries a `url` (image-url derives the ref from the URL
  // itself in that case). Callers increasingly pass the dereferenced
  // shape so they get metadata (real dimensions, lqip, palette) in the
  // same query round trip.
  const anyAsset = source?.asset as { _ref?: string; _id?: string; url?: string } | undefined
  if (!anyAsset?._ref && !anyAsset?._id && !anyAsset?.url) {
    return undefined
  }

  return imageBuilder?.image(source).auto('format').fit('max')
}

export function urlForOpenGraphImage(image: Image | undefined) {
  return urlForImage(image)?.width(1200).height(627).fit('crop').url()
}

export const urlForLogo = (source: Image | undefined) => {
  if (!source?.asset?._ref) {
    return undefined
  }
  return imageBuilder?.image(source)
}

export function resolveHref(
  documentType?: string,
  slug?: string | { current?: string },
): string | undefined {
  // Extract `current` if `slug` is an object
  const slugValue = typeof slug === 'object' ? slug?.current : slug;

  switch (documentType) {
    case 'home':
      return '/';
    case 'about':
      return '/about';
    case 'project':
      return slugValue ? `/projects/${slugValue}` : undefined;
    default:
      console.warn('Invalid document type:', documentType);
      return undefined;
  }
}