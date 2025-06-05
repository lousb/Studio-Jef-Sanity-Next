'use client'

import { type QueryResponseInitial } from '@sanity/react-loader'

import { homePageQuery } from '@/sanity/lib/queries'
import { useQuery } from '@/sanity/loader/useQuery'
import { HomePagePayload } from '@/types'

import AllProjectsPage from './AllProjectsPage' // Correct import

type Props = {
  initial: QueryResponseInitial<HomePagePayload | null>
}

export default function ProjectPagePreview(props: Props) {
  const { initial } = props
  const { data, encodeDataAttribute } = useQuery<HomePagePayload | null>(
    homePageQuery,
    {},
    { initial },
  )

  if (!data) {
    return (
      <div className="text-center">
        Please start editing your Home document to see the preview!
      </div>
    )
  }

  return <AllProjectsPage data={data} encodeDataAttribute={encodeDataAttribute} />
}