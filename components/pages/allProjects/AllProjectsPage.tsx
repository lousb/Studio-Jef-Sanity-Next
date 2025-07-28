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
    return saved === '1' || saved === '2' || saved === '4' ? saved : '1';
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



  const getAvailableFilterOptions = () => {
    const available = {
      clients: new Set<string>(),
      genres: new Set<string>(),
      techniques: new Set<string>(),
      years: new Set<string>(),
    };

    validProjects.forEach((project) => {
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

      const isMatch = matchesClients && matchesGenres && matchesTechniques && matchesYears;

      if (isMatch) {
        project.client?.forEach((c) => available.clients.add(c.title));
        project.genre?.forEach((g) => available.genres.add(g.title));
        project.technique?.forEach((t) => available.techniques.add(t.title));
        available.years.add(project.year || 'Unknown');
      }
    });

    return available;
  };

  const availableOptions = getAvailableFilterOptions();
  
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
      className="all-projects-header flex flex-row space-x-4"
      >
        <div
          className="w-1/5 h-auto cursor-pointer"
          onClick={() => setFiltersVisible((prev) => !prev)}
        >
          <Reveal>Filters {filtersVisible ? '-' : '+'}</Reveal>
        </div>
        {/* {filtersVisible && ( */}
          <div className={`header-wrap w-[80%] ${!filtersVisible ? 'filters-invisible' : 'filters-visible'} mt-2 mb-2`}>
            <div className="aggregated-data space-y-4 filters-wrap">
              <div className="text-sm">
                <div className="flex flex-col space-y-2 text-xl">
                  <Reveal element='p'>
                    <p>Clients:</p>
                  </Reveal>
                  
                  <div className='flex flex-col'>
                  {clients.map((client) => {
                    const isSelected = selectedFilters.clients.has(client);
                    const isAvailable = availableOptions.clients.has(client);

                    return (
                      <button
                        key={client}
                        className={`inline-block text-xl ${
                          isSelected ? 'select-filter' : ''
                        } ${!isSelected && !isAvailable ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                        onClick={() => {
                          if (isSelected || isAvailable) toggleFilter('clients', client);
                        }}
                        disabled={!isSelected && !isAvailable}
                      >
                        <Reveal element="p">{client}</Reveal>
                      </button>
                    );
                  })}
                    </div>
                </div>
                <div className="flex flex-col space-y-2 text-xl">
                <Reveal element='p'>
                    <p>Genre:</p>
                  </Reveal>
                  <div className='flex flex-col m-0'>
                  {genres.map((genre) => {
                    const isSelected = selectedFilters.genres.has(genre);
                    const isAvailable = availableOptions.genres.has(genre);

                    return (
                      <button
                        key={genre}
                        className={`inline-block text-xl ${
                          isSelected ? 'select-filter' : ''
                        } ${!isSelected && !isAvailable ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                        onClick={() => {
                          if (isSelected || isAvailable) toggleFilter('genres', genre);
                        }}
                        disabled={!isSelected && !isAvailable}
                      >
                        <Reveal element="p">{genre}</Reveal>
                      </button>
                    );
                  })}
                    </div>
                </div>
                <div className="flex flex-col space-y-2 text-xl">
                  <Reveal element='p'>
                    <p>Technique:</p>
                  </Reveal>
                  <div className='flex flex-col m-0'>
                  {techniques.map((technique) => {
                    const isSelected = selectedFilters.techniques.has(technique);
                    const isAvailable = availableOptions.techniques.has(technique);

                    return (
                      <button
                        key={technique}
                        className={`inline-block text-xl ${
                          isSelected ? 'select-filter' : ''
                        } ${!isSelected && !isAvailable ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                        onClick={() => {
                          if (isSelected || isAvailable) toggleFilter('techniques', technique);
                        }}
                        disabled={!isSelected && !isAvailable}
                      >
                        <Reveal element="p">{technique}</Reveal>
                      </button>
                    );
                  })}

                  </div>
                </div>
                <div className="flex flex-col space-y-2 text-xl">
                <Reveal element='p'>
                    <p>Year:</p>
                  </Reveal>
                  <div className='flex flex-col m-0'>
                  {years.map((year) => {
                    const isSelected = selectedFilters.years.has(year);
                    const isAvailable = availableOptions.years.has(year);

                    return (
                      <button
                        key={year}
                        className={`inline-block text-xl ${
                          isSelected ? 'select-filter' : ''
                        } ${!isSelected && !isAvailable ? 'text-gray-400 cursor-not-allowed opacity-50' : ''}`}
                        onClick={() => {
                          if (isSelected || isAvailable) toggleFilter('years', year);
                        }}
                        disabled={!isSelected && !isAvailable}
                      >
                        <Reveal element="p">{year}</Reveal>
                      </button>
                    );
                  })}

                  </div>
                </div>
              </div>
            </div>
          </div>
        {/* )} */}
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