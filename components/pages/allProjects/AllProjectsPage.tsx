import type { EncodeDataAttributeCallback } from '@sanity/react-loader';
import { Link } from 'next-view-transitions';

import { ProjectListItem } from '@/components/pages/home/ProjectListItem';
import { Header } from '@/components/shared/Header';
import { resolveHref } from '@/sanity/lib/utils';
import RevealDiv from '@/components/global/revealDiv';
import Reveal from '@/components/global/Reveal';
import type { ProjectsPagePayload } from '@/types';

export function AllProjectsPage({
  data,
  encodeDataAttribute,
}: {
  data: {
    allProjects?: ProjectsPagePayload[];
  };
  encodeDataAttribute?: EncodeDataAttributeCallback;
}) {

  const validProjects = data?.allProjects?.filter(
    (project) => project && project.slug && project.title
  ) || [];

  return (
    <div className="space-y-6">
      <div className='columns-header'>
        One, Two, Four
      </div>
      <Header description="All Projects" />
      <div className="flex flex-row items-end justify-between space-x-4 all-projects-header">
        <div className="w-1/5 h-auto" style={{ cursor: 'pointer' }}>
          <Reveal>Filters +</Reveal>
        </div>
        <div className="w-[84%] mt-2 mb-2 ">
          <RevealDiv element={'div'} delay={0} elementClass={'text-lg md:text-4xl h-auto'}>
            Finding & connecting audiences. We're not in the business of boring.
          </RevealDiv>
        </div>
      </div>
      {validProjects.length > 0 ? (
        <div className="project-link-wrap grid gap-5 grid-cols-1 xl:grid-cols-2">
          {validProjects.map((project, key) => {
            console.log('Project slug:', project.slug); // Debugging

            const href = resolveHref(project._type, project.slug);
            console.log('Resolved href:', href); // Debugging

            if (!href) {
              return null;
            }

            const delay = Math.floor(key / 2) * 0.4 + 0.2;

            return (
              <Link
                key={key}
                href={href} // Ensure href is a valid string
                data-sanity={encodeDataAttribute?.(['projects', key, 'slug'])}
              >
                <RevealDiv delay={delay}>
                  <ProjectListItem project={project} />
                </RevealDiv>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500">No published projects found.</div>
      )}
    </div>
  );
}

export default AllProjectsPage;