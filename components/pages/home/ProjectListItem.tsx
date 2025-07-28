'use client';

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import ImageBox from '@/components/shared/ImageBox';
import MuxPlayer from '@mux/mux-player-react';
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
  const mediaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setIsMobile(window.innerWidth < 800);
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    intersectorRef.current = containerRef.current.querySelector('.mobile-intersector');

    if (titleRef.current && yearRef.current) {
      gsap.set([titleRef.current, yearRef.current], {
        opacity: 0,
        y: '100%',
      });
    }
  }, []);


  useEffect(() => {
    intersectorRef.current = document.querySelector('.mobile-intersector');

    const container = containerRef.current;
    const intersector = intersectorRef.current;
    const mediaEl = mediaRef.current;

    if (!container || !mediaEl) return;

    const parallaxAmount = 0.01; 

    if (titleRef.current && yearRef.current) {
      gsap.set([titleRef.current, yearRef.current], {
        opacity: 0,
        y: '100%',
      });
    }

    if (isMobile) {
      let observer: IntersectionObserver;
      let animationFrame: number;

      if (!intersector) return;

      const updatePosition = () => {
        if (!container || !titleRef.current || !yearRef.current || !intersector) return;

        const containerRect = container.getBoundingClientRect();
        const intersectorRect = intersector.getBoundingClientRect();

        const relativeY = intersectorRect.top - containerRect.top;
        const constrainedY = Math.max(0, Math.min(relativeY, containerRect.height - 32));

        gsap.to(textBoxRef.current, {
          y: constrainedY,
          duration: 0.3,
          ease: 'power2.out',
        });

        // Parallax on scroll
        const scrollProgress = containerRect.top / window.innerHeight;
        const translateY = scrollProgress * parallaxAmount * 100;

        gsap.to(mediaEl, {
          y: `${translateY}%`,
          duration: 0.6,
          ease: 'power3.out',
        });

        animationFrame = requestAnimationFrame(updatePosition);
      };

      observer = new IntersectionObserver(
        ([entry]) => {
          const isIntersecting = entry.isIntersecting;

          if (isIntersecting && !isActive.current) {
            isActive.current = true;

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

      observer.observe(intersector);

      return () => {
        observer.disconnect();
        cancelAnimationFrame(animationFrame);
      };
    }
else {
      const updateMouse = (e: MouseEvent) => {
        mouseX.current = e.clientX;
        mouseY.current = e.clientY;
      };

      const animate = () => {
        const rect = container.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const distanceFromCenter = mouseY.current - centerY;
        const maxMove = rect.height * parallaxAmount;

        const translateY = (distanceFromCenter / (rect.height / 2)) * maxMove;

        gsap.to(mediaEl, {
          y: `${translateY}px`,
          duration: 0.6,
          ease: 'power3.out',
        });

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

          gsap.to(textBoxRef.current, {
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


  const hasVideo = !!project.coverImage?.video?.asset?.playbackId;
  const hasImage = !!project.coverImage?.media?.asset;

  const [videoAspectRatio, setVideoAspectRatio] = useState('16:9');

  useEffect(() => {
    const ratio = project.coverImage?.video?.asset?.aspect_ratio;
    if (ratio && typeof ratio === 'string' && ratio.includes(':')) {
      setVideoAspectRatio(ratio);
    }
  }, [project.coverImage?.video?.asset?.aspect_ratio]);

  const [w, h] = videoAspectRatio.split(':').map(Number);
  const paddingBottom = `${(h / w) * 100}%`;

  return (
    <div ref={containerRef} className="flex flex-col gap-x-5 relative hybrid-media" style={{ overflow: 'hidden' }}>
      <div className="w-full aspect-video relative">
      {hasVideo ? (
        <div ref={mediaRef} className='will-change-transform' style={{ width: '100%', paddingBottom, position: 'relative', scale:1.1 }}>
          <div className="absolute inset-0" style={{pointerEvents: 'none'}}>
            <MuxPlayer
            userInactiveTimeout={0}
              playbackId={project.coverImage.video.asset.playbackId}
              streamType="on-demand"
              autoPlay="muted"
              loop="true"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>
      ) : hasImage ? (
        <div
        ref={mediaRef}
        style={{ width: '100%', position: 'relative', scale:1.1 }}
        className="will-change-transform"
        >
          <ImageBox
           
            image={project.coverImage.media}
            alt={`Cover image from ${project.title}`}
            classesWrapper="relative"
          />
          </div>
       
      ) : null}
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
  const [typedClients, setTypedClients] = useState('');
  const typingInterval = useRef<number | null>(null);
  const fullClientsText = project.client?.map(c => c.title).join(', ') || '';

  return (
    <div className="flex flex-wrap justify-between text-white w-full text-lg md:text-2xl flex-stretch overflow-hidden pl-2 pr-2 pointer-events-none">
      <div
        ref={titleRef}
        className="mask-out-page-transition flex pointer-events-all opacity-0 translate-y-full"
      >
        <div className="flex flex-col">
          {project.title}

          {project.client && project.client.length > 0 && (
            <span
              className="mt-0 opacity-75 cursor-pointer project-detail"
      
            >
              {typedClients || project.client.map((client, i) => (
                <span key={i}>
                  {client.title}
                  {i < project.client!.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      <div
        ref={yearRef}
        className="project-detail mask-out-page-transition flex pointer-events-all opacity-0 translate-y-full"
      >
        {project.year}
      </div>
    </div>
  );
}