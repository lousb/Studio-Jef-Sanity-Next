'use client';

import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import ImageBox from '@/components/shared/ImageBox';
import type { ShowcaseProject } from '@/types';

interface ProjectProps {
  project: ShowcaseProject;
}

export function ProjectListItem(props: ProjectProps) {
  const { project } = props;
  const [mouseY, setMouseY] = useState(0); // Track vertical mouse position
  const [isHovering, setIsHovering] = useState(false); // Track hover state
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the container
  const titleRef = useRef<HTMLDivElement>(null); // Reference to the title
  const yearRef = useRef<HTMLDivElement>(null); // Reference to the year

  const handleMouseMove = (event: React.MouseEvent) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeY = event.clientY - containerRect.top; // Calculate position relative to the container
      const constrainedY = Math.max(0, Math.min(relativeY, containerRect.height - 40)); // Constrain within 20px from top and bottom
      setMouseY(constrainedY);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true); // Enable hover state
    if (titleRef.current && yearRef.current) {
      const timeline = gsap.timeline();
      timeline
        .fromTo(
          titleRef.current,
          { y: 50, opacity: 0 }, // Start position (masked upward)
          { y: 0, opacity: 1, duration: 0.4, ease: 'power1.in' } // End position (revealed upward)
        )
        .fromTo(
          yearRef.current,
          { y: 50, opacity: 0 }, // Start position (masked upward)
          { y: 0, opacity: 1, duration: 0.4, ease: 'power1.in' }, // End position (revealed upward)
          0 // Start both animations at the same time
        );
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false); // Disable hover state
    if (titleRef.current && yearRef.current) {
      gsap.to(titleRef.current, {
        y: -50, // Mask out upward
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
  
      gsap.to(yearRef.current, {
        y: -50, // Mask out upward
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  };

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
        className="absolute left-0 w-full transition-transform pointer-events-none"
        style={{
          top: mouseY, // Use constrained mouse Y position
        }}
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
      {/* Title */}
      <div className="mask-out-page-transition flex pointer-events-all opacity-0" ref={titleRef}>
        {project.title}
      </div>
      {/* Year */}
      <div className="mask-out-page-transition flex pointer-events-all opacity-0" ref={yearRef}>
        {project.year}
      </div>
    </div>
  );
}