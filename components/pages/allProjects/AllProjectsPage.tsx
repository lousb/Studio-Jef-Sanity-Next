'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { EncodeDataAttributeCallback } from '@sanity/react-loader';
import { Link } from 'next-view-transitions';

import { ProjectListItem } from '@/components/pages/home/ProjectListItem';
import { Header } from '@/components/shared/Header';
import { resolveHref } from '@/sanity/lib/utils';
import RevealDiv from '@/components/global/revealDiv';
import Reveal from '@/components/global/Reveal';
import type { ProjectsPagePayload } from '@/types';

const COLUMN_STORAGE_KEY = 'projectGridColumns';

export function AllProjectsPage({
  data,
  encodeDataAttribute,
}: {
  data: {
    allProjects?: ProjectsPagePayload[];
  };
  encodeDataAttribute?: EncodeDataAttributeCallback;
}) {
  const [columns, setColumns] = useState<'1' | '2' | '4'>(() => {
    // Initialize state from localStorage during the first render
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    return saved === '1' || saved === '2' || saved === '4' ? saved : '2';
  });

  const gridRef = useRef<HTMLDivElement>(null);

  // Save preference to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, columns);
  }, [columns]);

  // Animate grid on column change
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.project-item-animate',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.0000001,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    }, gridRef);

    return () => ctx.revert();
  }, [columns]);

  const validProjects = data?.allProjects?.filter(
    (project) => project && project.slug && project.title
  ) || [];

  const columnClass = {
    '1': 'xl:grid-cols-1 one-column',
    '2': 'xl:grid-cols-2 two-column',
    '4': 'xl:grid-cols-4 four-column',
  }[columns];

  return (
    <div className="space-y-6">
      <div className="columns-header flex space-x-2 font-medium">
        {(['1', '2', '4'] as const).map((num) => (
          <button
            key={num}
            className={`text-1xl ${columns === num ? 'text-gray-400' : ''}`}
            onClick={() => setColumns(num)}
          >
            {num === '1' ? 'One' : num === '2' ? 'Two' : 'Four'}
          </button>
        ))}
      </div>

      <Header description="All Projects" />

      <div className="all-projects-header flex flex-row items-end justify-between space-x-4">
        <div className="w-1/5 h-auto" style={{ cursor: 'pointer' }}>
          <Reveal>Filters +</Reveal>
        </div>
        <div className="w-[84%] mt-2 mb-2">
          <RevealDiv element="div" delay={0} elementClass="text-4xl h-auto">
            Finding & connecting audiences. We're not in the business of boring.
          </RevealDiv>
        </div>
      </div>

      {validProjects.length > 0 ? (
        <div
          ref={gridRef}
          className={`project-link-wrap grid gap-5  ${columnClass}`}
        >
          {validProjects.map((project, key) => {
            const href = resolveHref(project._type, project.slug);
            if (!href) return null;
            const delay = (key / validProjects.length) * 0.5;
            return (
              <Link
                key={key}
                href={href}
                data-sanity={encodeDataAttribute?.(['projects', key, 'slug'])}
              >
                <div className="project-item-animate">
                  <RevealDiv delay={delay}>
                    <ProjectListItem project={project} />
                  </RevealDiv>
                </div>
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