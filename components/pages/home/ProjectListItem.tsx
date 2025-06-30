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

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isActive = useRef(false);
  const rafId = useRef<number>();

  const animate = () => {
  const container = containerRef.current;
  const textBox = textBoxRef.current;

  if (!container || !textBox) {
    rafId.current = requestAnimationFrame(animate);
    return;
  }

  const rect = container.getBoundingClientRect();
  const isInside =
    mouseX.current >= rect.left &&
    mouseX.current <= rect.right &&
    mouseY.current >= rect.top &&
    mouseY.current <= rect.bottom;

  const relativeY = mouseY.current - rect.top;
  const constrainedY = Math.max(0, Math.min(relativeY, rect.height - 40));
  const isTopHalf = relativeY < rect.height / 2;

  if (isInside) {
    if (!isActive.current) {
      isActive.current = true;

      const enterFromY = isTopHalf ? '-100%' : '100%';

      const tl = gsap.timeline();
      tl.fromTo(
        titleRef.current,
        { y: enterFromY, opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.4, ease: 'power1.inOut' }
      ).fromTo(
        yearRef.current,
        { y: enterFromY, opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.4, ease: 'power1.inOut' },
        0
      );
    }

    gsap.to(textBox, {
      y: constrainedY,
      duration: 0.6,
      ease: 'power4.out',
    });
  } else {
    if (isActive.current) {
      isActive.current = false;

      const exitToY = isTopHalf ? '-100%' : '100%';

      gsap.to(titleRef.current, {
        y: exitToY,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
      gsap.to(yearRef.current, {
        y: exitToY,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }

  rafId.current = requestAnimationFrame(animate);
};


  // Global mouse tracking
  useEffect(() => {
    const isMobile = window.innerWidth < 800;

    if (isMobile) {
      // Simulate the 'tap' effect immediately
      const textBox = textBoxRef.current;
      const title = titleRef.current;
      const year = yearRef.current;

      if (textBox && title && year) {
        gsap.set(textBox, {
          y: '50%',
          xPercent: 0,
          yPercent: -50,
          top: '50%',
          position: 'absolute',
        });

        const tl = gsap.timeline();
        tl.fromTo(
          title,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.4, ease: 'power1.inOut' }
        ).fromTo(
          year,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.4, ease: 'power1.inOut' },
          0
        );
      }
    } else {
      // Desktop interaction
      const updateMouse = (e: MouseEvent) => {
        mouseX.current = e.clientX;
        mouseY.current = e.clientY;
      };

      window.addEventListener('mousemove', updateMouse);
      animate();

      return () => {
        cancelAnimationFrame(rafId.current!);
        window.removeEventListener('mousemove', updateMouse);
      };
    }
  }, []);
  

  return (
    <div ref={containerRef} className="flex flex-col gap-x-5 relative">
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
