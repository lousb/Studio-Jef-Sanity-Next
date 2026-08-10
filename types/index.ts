import type { PortableTextBlock } from '@portabletext/types'
import type { Image } from 'sanity'

export interface MenuItem {
  page?: {
    _type: string
    slug?: string
    title?: string
  }
  link?: {
    _type: string
    url?: string
    title?: string
  }
}

export interface PageItem {
  _type: string
  slug?: string
  title?: string
}

export interface LinkItem {
  _type: string
  url?: string
  title?: string
}

export interface ShowcaseProject {
  _type: string
  title?: string
  year?: string
  slug?: string
  overview?: PortableTextBlock[]
  _updatedAt?: string
  tags?: string[]
  client?: { title: string }[]
  status?: string
  size?: string
  location?: string
  projectType?: { title: string }[]
  architects?: { title: string }[]
  coverImage?: {
    media?: {
      _type: 'image'
      asset: {
        _ref?: string
        _type?: string
        metadata?: {
          dimensions?: {
            width: number
            height: number
          }
          lqip?: string
        }
        url?: string
      }
      lqip?: string
    }
    video?: {
      asset: {
        playbackId?: string
        status?: string
        aspect_ratio?: string
        url?: string
      }
    }
  }
}

// Page payloads

export interface FeaturedMediaItem {
  mediaKey?: string
  project?: {
    title?: string
    slug?: { current: string }
  }
  block?: {
    _key: string
    image?: {
      asset?: {
        _id: string
        url: string
        metadata?: {
          dimensions?: { width: number; height: number; aspectRatio?: number }
          lqip?: string
        }
      }
    }
    caption?: string
    title?: string
    width?: '8col' | '16col' | '24col'
  }
}

export interface HomePagePayload {
  footer?: PortableTextBlock[]
  overview?: {
    text?: PortableTextBlock[]
    displayText?: boolean
  }
  title?: string
  customLogo?: Image
  _updatedAt?: string
  featuredMedia?: FeaturedMediaItem[]
}

export interface PreviewMediaBlock {
  _type: 'hybridMedia' | 'twoHybridMedia'
  _key?: string
  media?: { asset?: PreviewMediaAsset }
  caption?: string
  title?: string
  mediaOne?: {
    media?: { asset?: PreviewMediaAsset }
    caption?: string
    title?: string
  }
  mediaTwo?: {
    media?: { asset?: PreviewMediaAsset }
    caption?: string
    title?: string
  }
}

export interface PreviewMediaAsset {
  _id: string
  url: string
  metadata?: {
    dimensions?: { width: number; height: number }
    lqip?: string
  }
}

export interface ProjectsPagePayload {
  _type: string
  coverImage?: {
    image?: {
      asset?: {
        _ref?: string
        _type?: string
        metadata?: {
          dimensions?: {
            width: number
            height: number
          }
          lqip?: string
        }
      }
    }
    video?: {
      asset?: {
        playbackId?: string
        status?: string
      }
    }
  }
  previewMedia?: PreviewMediaBlock[]
  overview?: PortableTextBlock[]
  slug?: string
  tags?: string[]
  genre?: { title: string }[]
  technique?: { title: string }[]
  client?: { title: string }[]
  credits?: { title: string }[]
  title?: string
  year?: string
  status?: string
  size?: string
  location?: string
  projectType?: { title: string }[]
  architects?: { title: string }[]
  _updatedAt?: string
}

export interface ProjectPayload {
  year?: string
  status?: string
  size?: string
  location?: string
  projectType?: { title: string }[]
  architects?: { title: string }[]
  coverImage?: Image
  description?: PortableTextBlock[]
  overview?: PortableTextBlock[]
  client?: { title: string }[]
  site?: {
    urltitle?: string
    url: string
  }
  slug: string
  tags?: string[]
  title?: string
  content?: Content[]
}

export interface Content {
  _type: string
  _key: string
  photo?: {
    asset?: {
      url?: string
    }
  }
  caption?: string
  title?: string
  width?: string
  photoOne?: {
    asset?: {
      url?: string
    }
  }
  photoTwo?: {
    asset?: {
      url?: string
    }
  }
  textBlock?: object[]
  videoLink?: string
  video?: {
    asset?: {
      playbackId?: string
      assetId?: string
      url?: string
      status?: string
    }
  }
  videoOneLink?: string
  videoTwoLink?: string
}

export interface SettingsPayload {
  menuItems?: {
    page?: PageItem[]
    link?: LinkItem[]
  }
  overview?: {
    text?: PortableTextBlock[]
    displayText?: boolean
  }
  ogImage?: Image
  favIcon?: Image
  title?: string
}

export interface AboutPayload {
  overview?: PortableTextBlock[]
  title?: string
  aboutMedia?: {
    media?: {
      asset: Image & {
        metadata?: {
          lqip?: string
        }
      }
      width?: number
      height?: number
    }
    video?: {
      asset: {
        playbackId: string
        assetId?: string
        filename?: string
        url?: string
        aspect_ratio?: string
      }
    }
  }
  aboutLinks?: LinkItem[]
}