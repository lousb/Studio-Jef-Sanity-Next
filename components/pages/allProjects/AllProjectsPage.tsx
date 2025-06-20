import type { EncodeDataAttributeCallback } from '@sanity/react-loader'
import {Link} from 'next-view-transitions'

import { ProjectListItem } from '@/components/pages/home/ProjectListItem'
import { Header } from '@/components/shared/Header'
import { resolveHref } from '@/sanity/lib/utils'
import type { HomePagePayload } from '@/types'
import RevealDiv from '@/components/global/revealDiv'
import Reveal from '@/components/global/Reveal'

export interface HomePageProps {
  data: HomePagePayload | null
  encodeDataAttribute?: EncodeDataAttributeCallback
}

export function AllProjectsPage({ data, encodeDataAttribute }: HomePageProps) {
  console.log('AllProjectsPage data:', data) // Debugging
  const { overview = [], showcaseProjects = [] } = data ?? {}

  return (
    <div className="space-y-6">
      {/* Header */}
      {overview && <Header description={overview} />}
      <div className="flex flex-row items-end justify-between space-x-4">
        <div className="w-1/5 h-auto" style={{cursor:'pointer'}}> {/* 20% width */}
          <Reveal>Filters +</Reveal>
        </div>
        <div className="w-1/2 mt-2 mb-2 "> {/* 80% width */}
        <RevealDiv element={'div'} delay={0} elementClass={'text-lg md:text-4xl h-auto'}>We're not in the business of boring.<br/>Cool is our currency.</RevealDiv>
        </div>
      </div>
      {/* Showcase projects */}
      {showcaseProjects && showcaseProjects.length > 0 && (
        <div className="grid gap-5 grid-cols-1 xl:grid-cols-2">
          {showcaseProjects.map((project, key) => {
            const href = resolveHref(project?._type, project?.slug)
            console.log('Project href:', href) // Debugging
            if (!href) {
              return null
            }

            const delay = Math.floor(key / 2) * 0.4

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
                <RevealDiv delay={delay}>
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

export default AllProjectsPage
