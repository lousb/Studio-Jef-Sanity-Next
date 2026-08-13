'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { EncodeDataAttributeCallback } from '@sanity/react-loader';
import Link from 'next/link';

import { ProjectListItem } from '@/components/pages/home/ProjectListItem';
import { Header } from '@/components/shared/Header';
import { resolveHref } from '@/sanity/lib/utils';
import RevealDiv from '@/components/global/revealDiv';
import Reveal from '@/components/global/Reveal';
import type { ProjectsPagePayload } from '@/types';
import { ProjectHoverPreview, getPreviewImages } from '@/components/pages/home/ProjectHoverPreview';
import type { FlatPreviewImage } from '@/components/pages/home/ProjectHoverPreview';
import { InfiniteLoopHorizontal } from '@/components/global/InfiniteLoopHorizontal';
import { InfiniteLoop } from '@/components/global/InfiniteLoop';
import { useIsMobile } from '@/components/global/useIsMobile';
import ImageBox from '@/components/shared/ImageBox';

const COLUMN_STORAGE_KEY = 'projectGridColumns';

function MobileImageScroller({
  images,
}: {
  images: FlatPreviewImage[];
}) {
  const isMobile = useIsMobile();
  if (images.length === 0 || !isMobile) return null;

  return (
    <InfiniteLoopHorizontal>
      {images.map((img, i) => {
        const dimensions = img.asset.metadata?.dimensions;
        const aspectRatio = dimensions ? `${dimensions.width} / ${dimensions.height}` : undefined;

        return (
          <div
            key={i}
            className="relative w-[70vw] shrink-0 mr-2 overflow-hidden mobile-image-scroller-item"
            style={{ aspectRatio }}
          >
            <ImageBox
              image={{ asset: img.asset, lqip: img.asset.metadata?.lqip }}
              alt={img.title || img.caption || 'Project preview image'}
              caption={img.caption}
            />
          </div>
        );
      })}
    </InfiniteLoopHorizontal>
  );
}

// Single project row — shared by both mobile and desktop rendering paths
function ProjectRow({
  project,
  href,
  encodedSlug,
  isMobile,
  onMouseEnter,
  onMouseLeave,
}: {
  project: ProjectsPagePayload;
  href: string;
  encodedSlug?: ReturnType<EncodeDataAttributeCallback>;
  isMobile: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const mobilePreviewImages = getPreviewImages(project.previewMedia, Infinity); // mobile strip — ALL images

  return (
    <Link
      href={href}
      data-sanity={encodedSlug}
      className="project-item-animate contents"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="text-body-01 [grid-column:1/2]">
        {project.customIndex !== undefined && project.customIndex !== null
          ? String(project.customIndex).padStart(3, '0')
          : ''}
      </span>

      <span className="text-body-01 [grid-column:2/8] min-[768px]:[grid-column:2/22]">
        {project.title}
      </span>

      <span className="hidden min-[768px]:inline text-body-01 min-[768px]:[grid-column:7/9]">
        {project.projectType?.map((t) => t.title).join(', ') || '—'}
      </span>

      <span className="hidden min-[768px]:inline text-body-01 capitalize min-[768px]:[grid-column:19/21]">
        {project.status?.replace('-', ' ') || '—'}
      </span>

      <span className="text-body-01 [grid-column:8/9] min-[768px]:[grid-column:23/25] text-right">
        {project.year || '—'}
      </span>

      {/* Mobile-only horizontal preview strip, spans the full row width (8-col mobile grid) */}
      <div className="md:hidden [grid-column:1/9] pb-4 pt-1">
        <MobileImageScroller images={mobilePreviewImages} />
      </div>
    </Link>
  );
}

export function AllProjectsPage({
  data,
  encodeDataAttribute,
}: {
  data: {
    allProjects?: ProjectsPagePayload[];
  };
  encodeDataAttribute?: EncodeDataAttributeCallback;
}) {
  const isMobile = useIsMobile();

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

  // which project row (by index into filteredProjects) is currently hovered
  // — desktop only; on mobile this stays null so ProjectHoverPreview never renders
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);

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

  if (isMobile === null) return null; // avoid hydration flash before viewport is measured, matches AboutPage pattern

  return (
    <div className="space-y-6 all-projects-page">
      {/* Display aggregated lists at the top */}

      {filteredProjects.length > 0 ? (
        <div className="flex flex-col justify-center min-h-[100vh] mt-0">
          {isMobile ? (
            // Mobile: rows wrapped in the shared InfiniteLoop component
            <InfiniteLoop>
              <div
                ref={gridRef}
                className="grid gap-y-4 items-center"
              >
                {filteredProjects.map((project, key) => {
                  const href = resolveHref(project._type, project.slug);
                  if (!href) return null;

                  return (
                    <ProjectRow
                      key={key}
                      project={project}
                      href={href}
                      encodedSlug={encodeDataAttribute?.(['projects', key, 'slug'])}
                      isMobile={isMobile}
                      onMouseEnter={() => {}}
                      onMouseLeave={() => {}}
                    />
                  );
                })}
              </div>
            </InfiniteLoop>
          ) : (
            // Desktop: unchanged vertical grid with hover-driven preview
            <div
              ref={gridRef}
              className="grid gap-y-4 items-center"
            >
              {filteredProjects.map((project, key) => {
                const href = resolveHref(project._type, project.slug);
                if (!href) return null;

                return (
                  <ProjectRow
                    key={key}
                    project={project}
                    href={href}
                    encodedSlug={encodeDataAttribute?.(['projects', key, 'slug'])}
                    isMobile={isMobile}
                    onMouseEnter={() => setHoveredKey(key)}
                    onMouseLeave={() =>
                      setHoveredKey((current) => (current === key ? null : current))
                    }
                  />
                );
              })}
            </div>
          )}

          {/* Desktop-only hover overlay — never mounted on mobile */}
          {!isMobile && (
            <ProjectHoverPreview
              images={
                hoveredKey !== null
                  ? getPreviewImages(filteredProjects[hoveredKey]?.previewMedia) // unchanged, still capped at 3
                  : []
              }
              active={hoveredKey !== null}
            />
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500">No published projects found.</div>
      )}
    </div>
  );
}

export default AllProjectsPage;