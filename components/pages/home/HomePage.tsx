import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import {Link} from 'next-view-transitions'

import { ProjectListItem } from '@/components/pages/home/ProjectListItem'
import { Header } from '@/components/shared/Header'
import { resolveHref } from '@/sanity/lib/utils'
import type { HomePagePayload } from '@/types'
import RevealDiv from '@/components/global/revealDiv'
import { HeroGallery } from './HeroGallery'

export interface HomePageProps {
  data: HomePagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function HomePage({ data, encodeDataAttribute }: HomePageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const { overview = [], showcaseProjects = [] } = data ?? {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="w-full h-300 overflow-hidden">
        {/* <HeroGallery/> */}
      </div>
      {overview && <Header description={overview} />}
      {/* Showcase projects */}
      {showcaseProjects && showcaseProjects.length > 0 && (
        <div className="grid gap-5 grid-cols-1 xl:grid-cols-2 project-link-wrap">
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
