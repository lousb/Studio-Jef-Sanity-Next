'use client'

import React, { useEffect, useState } from 'react'
import HeroGallery from './HeroGallery' // <-- the fancy animated version

// Extract gallery items from Sanity content
function extractGalleryItems(featuredMedia) {
  const items = []

  if (!Array.isArray(featuredMedia)) return items

  featuredMedia.forEach((project) => {
    if (!Array.isArray(project?.content)) return

    project.content.forEach((item) => {
      
      if (!item?._type) return
      

      const { _type, _key, caption } = item

      if (_type === 'hybridMedia' && item.featured) {
        
        
        const video = item.video?.asset
        const image = item.media?.asset

        if (video?.playbackId) {
          items.push({
            type: 'video',
            playbackId: video.playbackId,
            aspectRatio: video.data?.aspect_ratio || 16 / 9,
            key: _key,
          })
        } else if (image?.url) {
          items.push({
            type: 'image',
            src: image.url,
            caption: caption || '',
            key: _key,
          })
        }
      }

      if (_type === 'twoHybridMedia') {
        if (item.leftFeatured) {
          const video = item.leftVideo?.asset
          const image = item.leftImage?.asset

          if (video?.playbackId) {
            items.push({
              type: 'video',
              playbackId: video.playbackId,
              aspectRatio: video.data?.aspect_ratio || 16 / 9,
              key: `${_key}-left`,
            })
          } else if (image?.url) {
            items.push({
              type: 'image',
              src: image.url,
              caption: caption || '',
              key: `${_key}-left`,
            })
          }
        }

        if (item.rightFeatured) {
          const video = item.rightVideo?.asset
          const image = item.rightImage?.asset

          if (video?.playbackId) {
            items.push({
              type: 'video',
              playbackId: video.playbackId,
              aspectRatio: video.data?.aspect_ratio || 16 / 9,
              key: `${_key}-right`,
            })
          } else if (image?.url) {
            items.push({
              type: 'image',
              src: image.url,
              caption: caption || '',
              key: `${_key}-right`,
            })
          }
        }
      }
    })
  })

  return items
}

const HeroGalleryWrapper = ({ featuredMedia }) => {
  const [mediaItems, setMediaItems] = useState([])

  useEffect(() => {
    const extracted = extractGalleryItems(featuredMedia)
    setMediaItems(extracted)
  }, [featuredMedia])

  return <HeroGallery media={mediaItems} />
}

export default HeroGalleryWrapper
