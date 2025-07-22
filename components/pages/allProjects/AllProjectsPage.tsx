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

  const headerRef = useRef<HTMLDivElement>(null);

  const [selectedFilters, setSelectedFilters] = useState({
    clients: new Set<string>(),
    credits: new Set<string>(),
    genres: new Set<string>(),
    techniques: new Set<string>(),
    years: new Set<string>(),
  });

  const [filtersVisible, setFiltersVisible] = useState(false);

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
  const years = [
    ...new Set(
      validProjects.map((project) => project.year || 'Unknown')
    ),
  ];

  useLayoutEffect(() => {
    if (!headerRef.current) return;

    const el = headerRef.current;
    gsap.killTweensOf(el); // Stop any ongoing animation

    gsap.fromTo(
      el,
      { height: el.offsetHeight },
      {
        height: 'auto',
        duration: 0.5,
        ease: 'power2.inOut',
      }
    );
  }, [filtersVisible]);
  

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
    const matchesYears =
      selectedFilters.years.size === 0 ||
      selectedFilters.years.has(project.year || 'Unknown');

    return matchesClients && matchesGenres && matchesTechniques && matchesYears;
  });

  return (
    <div className="space-y-6 all-projects-page">
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

      <div ref={headerRef}
      className="all-projects-header flex flex-row items-end space-x-4"
      >
        <div
          className="w-1/5 h-auto cursor-pointer"
          onClick={() => setFiltersVisible((prev) => !prev)}
        >
          <Reveal>Filters {filtersVisible ? '-' : '+'}</Reveal>
        </div>
        {filtersVisible && (
          <div className="header-wrap w-[80%] mt-2 mb-2">
            <div className="aggregated-data space-y-4 filters-wrap">
              <div className="text-sm">
                <div className="flex flex-col space-y-2 text-2xl">
                  <Reveal element='p'>
                    <p>Clients:</p>
                  </Reveal>
                  
                  <div className='flex flex-col m-0'>
                  {clients.length > 0
                    ? clients.map((client) => (
                        <button
                          key={client}
                          className={`inline-block text-2xl ${
                            selectedFilters.clients.has(client) ? ' select-filter' : ''
                          }`}
                          onClick={() => toggleFilter('clients', client)}
                        >
                           <Reveal element='p'>
                          {client}
                          </Reveal>
                        </button>
                      ))
                    : 'None'}
                    </div>
                </div>
                <div className="flex flex-col space-y-2 text-2xl">
                <Reveal element='p'>
                    <p>Genre:</p>
                  </Reveal>
                  <div className='flex flex-col m-0'>
                  {genres.length > 0
                    ? genres.map((genre) => (
                        <button
                          key={genre}
                          className={`inline-block text-2xl ${
                            selectedFilters.genres.has(genre) ? ' select-filter' : ''
                          }`}
                          onClick={() => toggleFilter('genres', genre)}
                        >
                           <Reveal element='p'>
                          {genre}
                          </Reveal>
                        </button>
                      ))
                    : 'None'}
                    </div>
                </div>
                <div className="flex flex-col space-y-2 text-2xl">
                  <Reveal element='p'>
                    <p>Technique:</p>
                  </Reveal>
                  <div className='flex flex-col m-0'>
                  {techniques.length > 0
                    ? techniques.map((technique) => (
                        <button
                          key={technique}
                          className={`inline-block text-2xl ${
                            selectedFilters.techniques.has(technique) ? ' select-filter' : ''
                          }`}
                          onClick={() => toggleFilter('techniques', technique)}
                        >
                          <Reveal element='p'>
                          {technique}
                          </Reveal>
                        </button>
                      ))
                    : 'None'}
                  </div>
                </div>
                <div className="flex flex-col space-y-2 text-2xl">
                <Reveal element='p'>
                    <p>Year:</p>
                  </Reveal>
                  <div className='flex flex-col m-0'>
                  {years.length > 0
                    ? years.map((year) => (
                        <button
                          key={year}
                          className={`inline-block text-2xl ${
                            selectedFilters.years.has(year) ? 'select-filter' : ''
                          }`}
                          onClick={() => toggleFilter('years', year)}
                        >
                           <Reveal element='p'>
                          {year}
                          </Reveal>
                        </button>
                      ))
                    : 'None'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* {!filtersVisible && (
          <Reveal element='p' elementClass="text-4xl h-auto">
            Sharing real people to real audiences
          </Reveal>
        )} */}
      </div>

      {filteredProjects.length > 0 ? (
        <div
          ref={gridRef}
          className={`project-link-wrap grid gap-5 ${columnClass}`}
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