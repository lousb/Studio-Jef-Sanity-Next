import { groq } from 'next-sanity'

export const homePageQuery = groq`
*[_type == "home"][0]{
  _id,
  _updatedAt,
  title,
  customLogo,
  overview {
    text,
    displayText,
  },
  showcaseProjects[]->{
    title,
    "slug": slug.current,
    year,
    overview,
    coverImage {
      asset,
      "lqip": asset->metadata.lqip,
    }
  }
}
`

export const projectsPageQuery = groq`
*[_type == "project" && defined(slug) && defined(title)]{
  title,
  "slug": slug.current,
  overview,
  year,
  coverImage {
    asset,
    "lqip": asset->metadata.lqip,
  },
  genre[]->{
    title
  },
  technique[]->{
    title
  },
  client[]->{
    title
  },
  credits[]->{
    title
  }
}
`

export const moreProjectsQuery = groq`
  *[_type == "home"][0]{
    showcaseProjects[]->{
      _type,
      coverImage{
        _type,
        asset,
        "lqip": asset->metadata.lqip,
      },
      overview,
      "slug": slug.current,
      title,
      year,
      _updatedAt,
    },
  }
`

export const aboutPageQuery = groq`
  *[_type == "about"][0]{
    _id,
    title,
    customLogo,
    overview,
    aboutImage{
      _type,
      asset,
      "lqip": asset->metadata.lqip,
    },
    aboutLinks[]{
      _type,
      title,
      url,
    },
  }
`

export const homePageTitleQuery = groq`
  *[_type == "home"][0].title
`

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    year,
    coverImage,
    description,
    overview,
    site,
    "slug": slug.current,
    title,

    // Direct mux video blocks
    "hybridVideos": content[@._type == "hybridMedia" && defined(video)]{
      caption,
      featured,
      video{
        asset->{
          _id,
          playbackId,
          status
        }
      }
    },
    "twoHybridVideos": content[@._type == "twoHybridMedia" && (defined(leftVideo) || defined(rightVideo))]{
      caption,
      featured,
      leftVideo{
        asset->{
          _id,
          playbackId,
          status
        }
      },
      rightVideo{
        asset->{
          _id,
          playbackId,
          status
        }
      }
    },

    content[]{
      _type == 'singleImage' => {
        _type,
        _key,
        photo{
          _type,
          asset,
          "lqip": asset->metadata.lqip,
        },
        caption,
      },
      _type == 'twoImages' => {
        _type,
        _key,
        photoOne{
          _type,
          asset,
          "lqip": asset->metadata.lqip,
        },
        photoTwo{
          _type,
          asset,
          "lqip": asset->metadata.lqip,
        },
        caption,
      },
      _type == 'textBlock' => {
        _type,
        _key,
        description,
      },
      _type == 'singleVideo' => {
        _type,
        _key,
        videoLink,
        caption,
      },
      _type == 'twoVideos' => {
        _type,
        _key,
        videoOneLink,
        videoTwoLink,
        caption,
      },
      _type == "video" => {
        _type,
        _key,
        asset->{
          playbackId,
          assetId,
          filename,
          "url": "https://stream.mux.com/" + playbackId
        },
        caption,
      },
      _type == 'hybridMedia' => {
        _type,
        _key,
        caption,
        featured,
        media{
          _type,
          asset,
          "lqip": asset->metadata.lqip,
        },
        video{
          asset->{
            playbackId,
            assetId,
            filename,
            "url": "https://stream.mux.com/" + playbackId
          }
        }
      },
      _type == 'twoHybridMedia' => {
        _type,
        _key,
        caption,
        featured,
        leftImage{
          _type,
          asset,
          "lqip": asset->metadata.lqip,
        },
        leftVideo{
          asset->{
            playbackId,
            assetId,
            filename,
            "url": "https://stream.mux.com/" + playbackId
          }
        },
        rightImage{
          _type,
          asset,
          "lqip": asset->metadata.lqip,
        },
        rightVideo{
          asset->{
            playbackId,
            assetId,
            filename,
            "url": "https://stream.mux.com/" + playbackId
          }
        },
      },
    },
  }
`

export const projectPaths = groq`
  *[_type == "project" && slug.current != null].slug.current
`

export const settingsQuery = groq`
  *[_type == "settings"][0]{
    footer,
    "menuItems": {
      "page": menuItems[_type == 'reference']->{
        _type,
        "slug": slug.current,
        title,
        },
      "link": menuItems[_type == 'navLink'] {
        _type,
        title,
        url,
      },
    },
    ogImage,
    favIcon,
    bgColor {
      'r': rgb.r,
      'g': rgb.g,
      'b': rgb.b,
    },
    textColor {
      'r': rgb.r,
      'g': rgb.g,
      'b': rgb.b,
    },
    displayLastUpdated,
  }
`
