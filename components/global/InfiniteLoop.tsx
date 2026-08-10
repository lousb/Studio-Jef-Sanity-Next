"use client";

import { useEffect, useRef, PropsWithChildren } from "react";
import { useLenis } from "./LenisProvider";
import type Lenis from "lenis";

type LenisInternals = Lenis & {
  animatedScroll: number;
  targetScroll: number;
  __isProgrammaticJump?: boolean;
};

export function InfiniteLoop({ children }: PropsWithChildren) {
  const singleRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);
  const isJumpingRef = useRef(false);
  const readyRef = useRef(false);
  const lenis = useLenis();

  const teleport = (targetLenis: LenisInternals, pos: number) => {
    isJumpingRef.current = true;
    targetLenis.__isProgrammaticJump = true; // flag BEFORE scrollTo so the synchronous 'scroll' event sees it

    const pending = targetLenis.targetScroll - targetLenis.animatedScroll;

    targetLenis.scrollTo(pos, { immediate: true, force: true });
    targetLenis.targetScroll = pos + pending;

    requestAnimationFrame(() => {
      isJumpingRef.current = false;
      targetLenis.__isProgrammaticJump = false;
    });
  };

  useEffect(() => {
    if (!lenis || !singleRef.current) return;

    const l = lenis as LenisInternals;
    const single = singleRef.current;

    const measure = () => {
      const h = single.getBoundingClientRect().height;
      if (h === 0) return;

      const prevHeight = heightRef.current;
      heightRef.current = h;
      lenis.resize();

      if (!readyRef.current) {
        readyRef.current = true;
        teleport(l, h);
        return;
      }

      if (prevHeight > 0 && prevHeight !== h) {
        const ratio = lenis.scroll / prevHeight;
        teleport(l, ratio * h);
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(single);
    measure();

    return () => ro.disconnect();
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;

    const l = lenis as LenisInternals;

    const onScroll = (instance: Lenis) => {
      if (isJumpingRef.current) return;
      const h = heightRef.current;
      if (!h) return;

      const { scroll } = instance;

      if (scroll < h) {
        teleport(l, scroll + h);
      } else if (scroll >= h * 2) {
        teleport(l, scroll - h);
      }
    };

    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  return (
    <div>
      <div ref={singleRef}>{children}</div>
      <div aria-hidden="true">{children}</div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}