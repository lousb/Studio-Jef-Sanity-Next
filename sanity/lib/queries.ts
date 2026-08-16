import { groq } from 'next-sanity'

// Shared fragment: every image asset projection pulls the same three
// things needed to render with zero layout shift —
//  - dimensions: real aspect ratio, known before a single image byte loads
//  - lqip: tiny blurred base64 preview, inlined in the payload (no extra request)
//  - palette.dominant.background: a solid fallback colour, paints instantly
// Keep this in sync everywhere an image asset is dereferenced below.
const ASSET_META = groq`
  metadata {
    dimensions,
    lqip,
    palette { dominant { background } }
  }
`

export const homePageQuery = groq`
  *[_type == "home"][0]{
    _id,
    _updatedAt,
    overview{
      text,
      displayText,
    },
    customLogo,
    showcaseProjects[]{
      scaleTile,
      project->{
        _type,
        _id,
        coverImage {
          media {
            _type,
            asset->{
              _id,
              url,
              ${ASSET_META}
            }
          },
          video {
            asset->{
              playbackId,
              "aspect_ratio": data.aspect_ratio,
              "url": "https://stream.mux.com/" + playbackId
            }
          }
        },
        overview,
        "slug": slug.current,
        title,
        year,
        status,
        size,
        location,
        projectType[]->{
          title
        },
        architects[]->{
          title
        },
        client[]->{
          title
        }
      }
    },
    title,
   featuredMedia[]{
    mediaKey,
    "project": project->{
      title,
      slug
    },
    "block": project->content[_key == ^.mediaKey][0]{
      _key,
      "image": media{ asset->{ _id, url, ${ASSET_META} } },
      caption,
      title,
      width
    }
  }
  }
`

// sanity/lib/queries.ts
export const projectsPageQuery = groq`
*[_type == "project" && defined(slug) && defined(title)]{
  _type,
  customIndex,
  title,
  slug,
  coverImage {
    media {
      _type,
      asset->{
        _id,
        url,
        ${ASSET_META}
      }
    },
    video {
      asset->{
        playbackId,
        "aspect_ratio": data.aspect_ratio,
        "url": "https://stream.mux.com/" + playbackId
      }
    }
  },
  "previewMedia": content[_type in ["hybridMedia", "twoHybridMedia"]]{
    _type,
    _key,
    media{ asset->{ _id, url, ${ASSET_META} } },
    caption,
    title,
    mediaOne{
      media{ asset->{ _id, url, ${ASSET_META} } },
      caption,
      title
    },
    mediaTwo{
      media{ asset->{ _id, url, ${ASSET_META} } },
      caption,
      title
    }
  },
  overview,
  year,
  status,
  size,
  location,
  projectType[]->{
    title
  },
  architects[]->{
    title
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
  *[_type == "project"] | order(_updatedAt desc) {
    _type,
    coverImage {
      media {
        _type,
        asset->{
          _id,
          url,
          ${ASSET_META}
        }
      },
      video {
        asset->{
          playbackId,
          "aspect_ratio": data.aspect_ratio,
          "url": "https://stream.mux.com/" + playbackId
        }
      }
    },
    overview,
    "slug": slug.current,
    title,
    year,
    status,
    size,
    location,
    _updatedAt,
  }
`

export const aboutPageQuery = groq`
  *[_type == "about"][0]{
    _id,
    title,
    customLogo,
    overview,
    media[]{
      _type,
      _key,
      caption,
      media{
        asset->{
          _id,
          url,
          ${ASSET_META}
        }
      }
    },
    services,
    press,
    location,
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
    customIndex,
    year,
    status,
    size,
    location,
    projectType[]->{
      title
    },
    architects[]->{
      title
    },
    client[]->{
      title
    },
    coverImage {
      media {
        _type,
        asset->{
          _id,
          url,
          ${ASSET_META}
        }
      },
      video {
        asset->{
          playbackId,
          aspect_ratio,
          "url": "https://stream.mux.com/" + playbackId
        }
      }
    },
    description,
    overview,
    site,
    "slug": slug.current,
    title,

    content[]{
      _type == 'singleImage' => {
        _type,
        _key,
        photo{
          _type,
          "asset": asset->{ _id, url, ${ASSET_META} },
        },
        caption,
      },
      _type == 'twoImages' => {
        _type,
        _key,
        photoOne{
          _type,
          "asset": asset->{ _id, url, ${ASSET_META} },
        },
        photoTwo{
          _type,
          "asset": asset->{ _id, url, ${ASSET_META} },
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
          "url": "https://stream.mux.com/" + playbackId,
          "aspect_ratio": data.aspect_ratio
        },
        caption,
      },
      _type == 'hybridMedia' => {
        _type,
        _key,
        caption,
        featured,
        title,
        width,
        media{
          _type,
          "asset": asset->{ _id, url, ${ASSET_META} },
        },
        video{
          asset->{
            playbackId,
            assetId,
            filename,
            "url": "https://stream.mux.com/" + playbackId,
            "aspect_ratio": data.aspect_ratio
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
          "asset": asset->{ _id, url, ${ASSET_META} },
        },
        leftVideo{
          asset->{
            playbackId,
            assetId,
            filename,
            "url": "https://stream.mux.com/" + playbackId,
            "aspect_ratio": data.aspect_ratio
          }
        },
        rightImage{
          _type,
          "asset": asset->{ _id, url, ${ASSET_META} },
        },
        rightVideo{
          asset->{
            playbackId,
            assetId,
            filename,
            "url": "https://stream.mux.com/" + playbackId,
            "aspect_ratio": data.aspect_ratio
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
    overview{
      text,
      displayText,
    },
    ogImage,
    favIcon,
  }
`