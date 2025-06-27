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
  coverImage?: Image
  overview?: PortableTextBlock[]
  slug?: string
  tags?: string[]
  title?: string
  year?: string
  _updatedAt?: string
}

// Page payloads

export interface HomePagePayload {
  footer?: PortableTextBlock[]
  overview?: any
  showcaseProjects?: ShowcaseProject[]
  title?: string
  customLogo?: Image
  _updatedAt?: string
}

export interface ProjectsPagePayload {
  _type: string
  coverImage?: Image
  overview?: PortableTextBlock[]
  slug?: string
  tags?: string[] // General tags
  genre?: { title: string }[] // Genres
  technique?: { title: string }[] // Techniques
  client?: { title: string }[] // Clients
  credits?: { title: string }[] // Credits
  title?: string
  year?: string
  _updatedAt?: string
}

export interface ProjectPayload {
  year?: string
  coverImage?: Image
  description?: PortableTextBlock[]
  overview?: PortableTextBlock[]
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
  // Fields for singleImage
  photo?: {
    asset?: {
      url?: string
    }
  }
  caption?: string
  // Fields for twoImages
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
  // Fields for textBlock
  textBlock?: object[]
  // Fields for singleVideo
  videoLink?: string
  // Fields for video
  video?: {
    asset?: {
      playbackId?: string
      assetId?: string
      url?: string
      status?: string
    }
  }
  // Fields for twoVideos
  videoOneLink?: string
  videoTwoLink?: string
}

export interface SettingsPayload {
  menuItems?: {
    page?: PageItem[]
    link?: LinkItem[]
  }
  ogImage?: Image
  favIcon?: Image
  title?: string
  bgColor: {
    r?: string
    g?: string
    b?: string
  }
  textColor: {
    r?: string
    g?: string
    b?: string
  }
  displayLastUpdated: boolean
}

export interface AboutPayload {
  overview?: PortableTextBlock[]
  title?: string
  aboutImage?: {
    asset: Image
    width: number
    height: number
  }
  aboutLinks?: LinkItem[]
}
