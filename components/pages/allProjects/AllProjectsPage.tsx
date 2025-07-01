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
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    return saved === '1' || saved === '2' || saved === '4' ? saved : '2';
  });

  const [selectedFilters, setSelectedFilters] = useState({
    clients: new Set<string>(),
    credits: new Set<string>(),
    genres: new Set<string>(),
    techniques: new Set<string>(),
  });

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, columns);
  }, [columns]);

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

  const clients = [
    ...new Set(
      validProjects.flatMap((project) =>
        project.client?.map((item) => item.title) || []
      )
    ),
  ];
  const credits = [
    ...new Set(
      validProjects.flatMap((project) =>
        project.credit?.map((item) => item.title) || []
      )
    ),
  ];
  const genres = [
    ...new Set(
      validProjects.flatMap((project) =>
        project.genre?.map((item) => item.title) || []
      )
    ),
  ];
  const techniques = [
    ...new Set(
      validProjects.flatMap((project) =>
        project.technique?.map((item) => item.title) || []
      )
    ),
  ];

  const toggleFilter = (type: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters((prev) => {
      const updatedSet = new Set(prev[type]);
      if (updatedSet.has(value)) {
        updatedSet.delete(value);
      } else {
        updatedSet.add(value);
      }
      return { ...prev, [type]: updatedSet };
    });
  };

  const filteredProjects = validProjects.filter((project) => {
    const matchesClients =
      selectedFilters.clients.size === 0 ||
      project.client?.some((item) => selectedFilters.clients.has(item.title));
    const matchesGenres =
      selectedFilters.genres.size === 0 ||
      project.genre?.some((item) => selectedFilters.genres.has(item.title));
    const matchesTechniques =
      selectedFilters.techniques.size === 0 ||
      project.technique?.some((item) => selectedFilters.techniques.has(item.title));

    return matchesClients && matchesGenres && matchesTechniques;
  });

  return (
    <div className="space-y-6">
      {/* Display aggregated lists at the top */}

      <div className={`mobile-intersector`}></div>
      <div className="columns-header flex space-x-2 font-medium">
        {(['1', '2', '4'] as const).map((num) => (
          <RevealDiv
            element="span"
            delay={0}
            elementClass={`text-1xl ${columns === num ? 'text-gray-400' : ''}`}
          >
            <button
              key={num}
              className={`text-1xl ${columns === num ? 'text-gray-400' : ''}`}
              onClick={() => setColumns(num)}
            >
              {num === '1' ? 'One' : num === '2' ? 'Two' : 'Four'}
            </button>
          </RevealDiv>
        ))}
      </div>

      <Header description="All Projects" />

      <div className="all-projects-header flex flex-row items-end justify-between space-x-4">
        <div className="w-1/5 h-auto" style={{ cursor: 'pointer' }}>
          <Reveal>Filters +</Reveal>
        </div>
        <div className="w-[84%] mt-2 mb-2">
        <div className="aggregated-data space-y-4 filters-wrap">
            <div className="text-sm">
              <div className='flex flex-col space-y-2 text-2xl'>
                <strong>Clients:</strong>{' '}
                {clients.length > 0
                  ? clients.map((client) => (
                      <button
                        key={client}
                        className={`inline-block text-2xl  ${
                          selectedFilters.clients.has(client) ? 'text-gray-400' : ''
                        }`}
                        onClick={() => toggleFilter('clients', client)}
                      >
                        {client}
                      </button>
                    ))
                  : 'None'}
              </div>
              <div className='flex flex-col space-y-2 text-2xl'>
                <strong>Genre:</strong>{' '}
                {genres.length > 0
                  ? genres.map((genre) => (
                      <button
                        key={genre}
                        className={`inline-block text-2xl  ${
                          selectedFilters.genres.has(genre) ? 'text-gray-400' : ''
                        }`}
                        onClick={() => toggleFilter('genres', genre)}
                      >
                        {genre}
                      </button>
                    ))
                  : 'None'}
              </div>
              <div className='flex flex-col space-y-2 text-2xl'>
                <strong>Technique:</strong>{' '}
                {techniques.length > 0
                  ? techniques.map((technique) => (
                      <button
                        key={technique}
                        className={`inline-block text-2xl  ${
                          selectedFilters.techniques.has(technique) ? 'text-gray-400' : ''
                        }`}
                        onClick={() => toggleFilter('techniques', technique)}
                      >
                        {technique}
                      </button>
                    ))
                  : 'None'}
              </div>
            </div>
          </div>
          <RevealDiv element="div" delay={0} elementClass="text-4xl h-auto">
            Finding & connecting audiences. We're not in the business of boring.
          </RevealDiv>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div
          ref={gridRef}
          className={`project-link-wrap grid gap-5  ${columnClass}`}
        >
          {filteredProjects.map((project, key) => {
            const href = resolveHref(project._type, project.slug);
            if (!href) return null;
            const delay = (key / filteredProjects.length) * 0.5;
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