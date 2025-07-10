'use client';

import React, { useRef, useEffect, useState } from 'react';
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
  const intersectorRef = useRef<Element | null>(null);

  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const isActive = useRef(false);
  const rafId = useRef<number>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 800);
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    intersectorRef.current = document.querySelector('.mobile-intersector');

    // Debug: Check if refs are populated

      if (titleRef.current && yearRef.current) {
        gsap.set([titleRef.current, yearRef.current], {
          opacity: 0,
          y: '100%',
        });
        console.log('Initial state set by GSAP');
      }
    
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const intersector = intersectorRef.current;

    if (!container || !intersector) return;

    if (isMobile) {
      let observer: IntersectionObserver;
      let animationFrame: number;

      const updatePosition = () => {
        if (!container || !titleRef.current || !yearRef.current || !intersector) return;

        const containerRect = container.getBoundingClientRect();
        const intersectorRect = intersector.getBoundingClientRect();

        const relativeY = intersectorRect.top - containerRect.top;
        const constrainedY = Math.max(0, Math.min(relativeY, containerRect.height - 40));

        gsap.to(textBoxRef.current, {
          y: constrainedY,
     
          duration: 0.3,
          ease: 'power2.out',
        });

        animationFrame = requestAnimationFrame(updatePosition);
      };

      observer = new IntersectionObserver(
        ([entry]) => {
          const isIntersecting = entry.isIntersecting;
          console.log('IntersectionObserver triggered:', { isIntersecting });

          if (isIntersecting && !isActive.current) {
            isActive.current = true;

            // Reveal titles and years when intersecting
            gsap.to([titleRef.current, yearRef.current], {
              y: '0%',
              opacity: 1,
              duration: 0.4,
              ease: 'power1.out',
            });

            animationFrame = requestAnimationFrame(updatePosition);
          } else if (!isIntersecting && isActive.current) {
            isActive.current = false;
            cancelAnimationFrame(animationFrame);

            // Hide titles and years when not intersecting
            gsap.to([titleRef.current, yearRef.current], {
              y: '100%',
              opacity: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        },
        {
          root: null,
          threshold: 0.05,
        }
      );
      

      observer.observe(container);

      return () => {
        observer.disconnect();
        cancelAnimationFrame(animationFrame);
      };
    } else {
      // Desktop fallback with mouse tracking
      const updateMouse = (e: MouseEvent) => {
        mouseX.current = e.clientX;
        mouseY.current = e.clientY;
      };

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

            gsap.timeline()
              .fromTo(
                titleRef.current,
                { y: enterFromY, opacity: 0 },
                { y: '0%', opacity: 1, duration: 0.4, ease: 'power1.inOut' }
              )
              .fromTo(
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

      window.addEventListener('mousemove', updateMouse);
      animate();

      return () => {
        cancelAnimationFrame(rafId.current!);
        window.removeEventListener('mousemove', updateMouse);
      };
    }
  }, [isMobile]);

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
      <div
        ref={titleRef}
        className="mask-out-page-transition flex pointer-events-all opacity-0 translate-y-full"
      >
        {project.title}
      </div>
      <div
        ref={yearRef}
        className="mask-out-page-transition flex pointer-events-all opacity-0 translate-y-full"
      >
        {project.year}
      </div>
    </div>
  );
}
