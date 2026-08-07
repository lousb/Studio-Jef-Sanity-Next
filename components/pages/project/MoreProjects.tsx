import {Link} from 'next-view-transitions'
import MuxPlayer from '@mux/mux-player-react'

import ImageBox from '@/components/shared/ImageBox'
import { resolveHref } from '@/sanity/lib/utils'
import type { ShowcaseProject } from '@/types'

interface ProjectProps {
  previous: ShowcaseProject
  next: ShowcaseProject
}

function CoverMedia({ project }: { project: ShowcaseProject }) {
  const hasVideo = !!project.coverImage?.video?.asset?.playbackId
  const hasImage = !!project.coverImage?.media?.asset

  if (hasVideo) {
    return (
      <div className="relative w-full aspect-video">
        <MuxPlayer
          userInactiveTimeout={0}
          playbackId={project.coverImage.video.asset.playbackId}
          streamType="on-demand"
          autoPlay="muted"
          loop="true"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  if (hasImage) {
    return (
      <ImageBox
        image={project.coverImage?.media}
        alt={`Cover image from ${project.title}`}
        classesWrapper="relative aspect-[16/9]"
      />
    )
  }

  return null
}

export function MoreProjects(props: ProjectProps) {
  const { previous, next } = props

  return (
    <div className="flex justify-between gap-x-5 pt-8 md:pt-20">
      {/* Previous project */}
      <div className="w-full">
        {previous && (
          <Link href={resolveHref(previous?._type, previous?.slug) ?? {}}>
            <div className="flex flex-col gap-x-5">
              <div className="flex flex-wrap justify-between mt-2 mb-2 w-full text-sm md:text-2xl">
                <div className="flex">← {previous.title}</div>
              </div>
              <div className="w-3/4 md:w-2/4">
                <CoverMedia project={previous} />
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Next project */}
      <div className="w-full">
        {next && (
          <Link href={resolveHref(next?._type, next?.slug) ?? {}}>
            <div className="flex flex-col gap-x-5 items-end">
              <div className="flex flex-wrap justify-between mt-2 mb-2 w-full text-sm md:text-2xl flex-strech fit-content">
                <div className="flex">{next.title} →</div>
              </div>
              <div className="w-3/4 md:w-2/4">
                <CoverMedia project={next} />
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}