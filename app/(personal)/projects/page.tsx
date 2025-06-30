import dynamic from 'next/dynamic';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

import { AllProjectsPage } from '@/components/pages/allProjects/AllProjectsPage';
import { loadProjectsPage } from '@/sanity/loader/loadQuery';
import { ProjectsPagePayload } from '@/types';

const AllProjectPreview = dynamic(
  () => import('@/components/pages/allProjects/ProjectPagePreview'),
);

export default async function IndexRoute() {

  const { data }: { data: ProjectsPagePayload[] } = await loadProjectsPage();


  if (draftMode().isEnabled) {
    return <AllProjectPreview initial={{ data }} />;
  }

  if (!data || data.length === 0) {
    return redirect('/');
  }

  return <AllProjectsPage data={{ allProjects: data }} />;
}