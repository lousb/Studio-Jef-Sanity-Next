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
  console.log('Fetching projects data...'); // Debugging

  const { data }: { data: ProjectsPagePayload[] } = await loadProjectsPage();

  console.log('Projects data fetched:', data); // Debugging

  if (draftMode().isEnabled) {
    console.log('Draft mode is enabled. Rendering preview...'); // Debugging
    return <AllProjectPreview initial={{ data }} />;
  }

  if (!data || data.length === 0) {
    console.log('No projects found. Redirecting to home page...'); // Debugging
    return redirect('/');
  }

  console.log('Rendering AllProjectsPage with data:', data); // Debugging
  return <AllProjectsPage data={{ allProjects: data }} />;
}