'use client';

import { type QueryResponseInitial } from '@sanity/react-loader';

import { projectsPageQuery } from '@/sanity/lib/queries';
import { useQuery } from '@/sanity/loader/useQuery';
import { ProjectsPagePayload } from '@/types';

import AllProjectPage from './AllProjectsPage';

type Props = {
  initial: QueryResponseInitial<ProjectsPagePayload[] | null>;
};

export default function AllProjectPreview(props: Props) {
  const { initial } = props;


  const { data, encodeDataAttribute } = useQuery<ProjectsPagePayload[] | null>(
    projectsPageQuery,
    {},
    { initial },
  );


  if (!data || data.length === 0) {
    return (
      <div className="text-center">
        Please start editing your Projects document to see the preview!
      </div>
    );
  }

  return <AllProjectPage data={{ allProjects: data }} encodeDataAttribute={encodeDataAttribute} />;
}