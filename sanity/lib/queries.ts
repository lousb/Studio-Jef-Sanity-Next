import { groq } from 'next-sanity'

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
              metadata {
                lqip
              }
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
      "image": media{ asset->{ _id, url, metadata{ dimensions, lqip } } },
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
  title,
  slug,
  coverImage {
    media {
      _type,
      asset->{
        _id,
        url,
        metadata {
          lqip
        }
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
  "previewMedia": content[_type in ["hybridMedia", "twoHybridMedia"]][0...4]{
    _type,
    _key,
    media{ asset->{ _id, url, metadata{ dimensions, lqip } } },
    caption,
    title,
    mediaOne{
      media{ asset->{ _id, url, metadata{ dimensions, lqip } } },
      caption,
      title
    },
    mediaTwo{
      media{ asset->{ _id, url, metadata{ dimensions, lqip } } },
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
          metadata {
            lqip
          }
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
    aboutMedia{
      _type,
      media{
        asset->{
          _id,
          url,
          metadata {
            lqip
          }
        }
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
          metadata {
            lqip
          }
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
          asset,
          "lqip": asset->metadata.lqip,
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
          asset,
          "lqip": asset->metadata.lqip,
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
          asset,
          "lqip": asset->metadata.lqip,
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