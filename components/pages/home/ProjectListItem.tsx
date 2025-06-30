'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import ImageBox from '@/components/shared/ImageBox';
import type { ShowcaseProject } from '@/types';

interface ProjectProps {
  project: ShowcaseProject;
}

export function ProjectListItem(props: ProjectProps) {
  const { project } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const textBoxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const mouseClientY = useRef<number | null>(null);
  const isHovering = useRef(false);
  const rafId = useRef<number>();

  const animate = () => {
    if (!isHovering.current || mouseClientY.current === null) {
      rafId.current = requestAnimationFrame(animate);
      return;
    }

    const container = containerRef.current;
    const textBox = textBoxRef.current;

    if (container && textBox) {
      const rect = container.getBoundingClientRect();
      const relativeY = mouseClientY.current - rect.top;
      const constrainedY = Math.max(0, Math.min(relativeY, rect.height - 40));

      gsap.to(textBox, {
        y: constrainedY,
        duration: 0.6,
        ease: 'power4.out',
      });
    }

    rafId.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseClientY.current = e.clientY;

    // If not hovering, start hover behavior and animation loop
    if (!isHovering.current) {
      isHovering.current = true;
      animate();

      if (titleRef.current && yearRef.current) {
        const tl = gsap.timeline();
        tl.fromTo(
          titleRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power1.inOut' }
        ).fromTo(
          yearRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power1.inOut' },
          0
        );
      }
    }
  };
  

  const handleMouseEnter = () => {
    isHovering.current = true;
    animate();

    if (titleRef.current && yearRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power1.inOut' }
      ).fromTo(
        yearRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power1.inOut' },
        0
      );
    }
  };

  const handleMouseLeave = () => {
    isHovering.current = false;
    mouseClientY.current = null;
    cancelAnimationFrame(rafId.current!);

    gsap.to(titleRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(yearRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafId.current!);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-x-5 relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full">
        <ImageBox
          image={project.coverImage}
          alt={`Cover image from ${project.title}`}
          classesWrapper="relative"
        />
      </div>

      <div
        ref={textBoxRef}
        className="absolute left-0 w-full pointer-events-none"
      >
        <TextBox project={project} titleRef={titleRef} yearRef={yearRef} />
      </div>
    </div>
  );
}

function TextBox({
  project,
  titleRef,
  yearRef,
}: {
  project: ShowcaseProject;
  titleRef: React.RefObject<HTMLDivElement>;
  yearRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex flex-wrap justify-between text-white w-full text-lg md:text-2xl flex-stretch overflow-hidden pl-2 pr-2 pointer-events-none">
      <div className="mask-out-page-transition flex pointer-events-all opacity-0" ref={titleRef}>
        {project.title}
      </div>
      <div className="mask-out-page-transition flex pointer-events-all opacity-0" ref={yearRef}>
        {project.year}
      </div>
    </div>
  );
}
