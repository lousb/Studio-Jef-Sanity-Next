import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import {Link} from 'next-view-transitions'

import { ProjectListItem } from '@/components/pages/home/ProjectListItem'
import { Header } from '@/components/shared/Header'
import { resolveHref } from '@/sanity/lib/utils'
import type { HomePagePayload } from '@/types'
import RevealDiv from '@/components/global/revealDiv'
import HeroGallery from './HeroGallery'
import Reveal from '@/components/global/Reveal'

export interface HomePageProps {
  data: HomePagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function HomePage({ data, encodeDataAttribute }: HomePageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { overview = [], showcaseProjects = [], featuredMedia = [] } = data ?? {}

  console.log('🎬 Featured Media:', featuredMedia)

  return (
    <div className="space-y-6 home-page">
      <div className={`mobile-intersector`}></div>
      {/* Header */}
      {/* <div className="w-full h-[150vh] overflow-hidden">
        <HeroGallery
        images={[
          { src: '/about-bg.png' },
          { src: '/about-bg-2.gif'},
          { src: '/about-bg-3.gif' },
          { src: '/about-bg-4.gif' },
          { src: '/about-bg-5.png' },
   
        ]}
        />
      </div> */}
      {overview && <Header description={overview} />}
      <div className="w-full h-auto flex pt-5 pb-5 bg-white home-project-title">
        <Reveal element='p' elementClass="text-4xl h-auto">
          Featured projects
        </Reveal>
      </div>
      {/* Showcase projects */}
      {showcaseProjects && showcaseProjects.length > 0 && (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 project-link-wrap bg-white">
          
          {showcaseProjects.map((project, key) => {
            const href = resolveHref(project?._type, project?.slug)
            if (!href) {
              return null
            }

            // Calculate delay for every second item in the row
            const delay = Math.floor(key / 2) * 0.2 + 0.2;

            return (
              <Link
                key={key}
                href={href}
                data-sanity={encodeDataAttribute?.([
                  'showcaseProjects',
                  key,
                  'slug',
                ])}
              >
                <RevealDiv delay={delay}> {/* Apply calculated delay */}
                  <ProjectListItem project={project} />
                </RevealDiv>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HomePage
