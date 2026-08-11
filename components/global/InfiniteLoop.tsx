"use client";

import { useEffect, useRef, useState, useCallback, PropsWithChildren } from "react";
import { useLenis } from "./LenisProvider";
import type Lenis from "lenis";

type LenisInternals = Lenis & {
  animatedScroll: number;
  targetScroll: number;
  __isProgrammaticJump?: boolean;
};

// Ignore layout deltas smaller than this — mobile browsers report
// spurious sub-pixel resizes (font swap rounding, chrome animating).
const RESIZE_THRESHOLD = 1;

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

// How many copies do we need on EACH side of the "real" copy so that a
// user can scroll at least one full viewport in either direction before
// hitting the edge of the rendered track? +1 is a safety margin so fast
// flicks/momentum never outrun the buffer and show blank space.
function computeCopiesPerSide(itemHeight: number, viewportHeight: number) {
  if (!itemHeight || itemHeight <= 0) return 1;
  return Math.max(1, Math.ceil(viewportHeight / itemHeight) + 1);
}

export function InfiniteLoop({ children }: PropsWithChildren) {
  const singleRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef(0);
  const isJumpingRef = useRef(false);
  const readyRef = useRef(false);
  const isTouchingRef = useRef(false);
  const pendingMeasureRef = useRef(false);
  const measureRafRef = useRef<number | null>(null);
  const jumpTokenRef = useRef(0);
  const copiesPerSideRef = useRef(1);
  const pendingTeleportRef = useRef<{ ratio: number } | null>(null);

  const [copiesPerSide, setCopiesPerSide] = useState(1);

  const lenis = useLenis();
  const lenisRef = useRef<LenisInternals | null>(null);

  useEffect(() => {
    lenisRef.current = (lenis as LenisInternals) ?? null;
  }, [lenis]);

  const teleport = useCallback((pos: number) => {
    const l = lenisRef.current;
    if (!l || !Number.isFinite(pos)) return;

    const token = ++jumpTokenRef.current;
    isJumpingRef.current = true;
    l.__isProgrammaticJump = true; // flag BEFORE scrollTo so the synchronous 'scroll' event sees it

    const animated = l.animatedScroll ?? l.scroll ?? 0;
    const target = l.targetScroll ?? animated;
    const pending = target - animated;

    l.scrollTo(pos, { immediate: true, force: true });
    l.targetScroll = pos + pending;

    requestAnimationFrame(() => {
      // only the most recent jump releases the lock — guards against an
      // overlapping teleport clearing it too early
      if (jumpTokenRef.current !== token) return;
      isJumpingRef.current = false;
      l.__isProgrammaticJump = false;
    });
  }, []);

  const scheduleMeasure = useCallback((fn: () => void) => {
    if (pendingMeasureRef.current) return;
    pendingMeasureRef.current = true;
    measureRafRef.current = requestAnimationFrame(() => {
      pendingMeasureRef.current = false;
      fn();
    });
  }, []);

  useEffect(() => {
    if (!lenis || !singleRef.current) return;
    const l = lenis as LenisInternals;
    const single = singleRef.current;

    // If a previous render changed the copy count, the DOM now matches
    // it — apply whatever teleport was waiting on that re-render.
    if (pendingTeleportRef.current) {
      const { ratio } = pendingTeleportRef.current;
      pendingTeleportRef.current = null;
      const h = heightRef.current;
      const target = copiesPerSideRef.current * h + ratio * h;
      lenis.resize();
      teleport(target);
    }

    const measure = () => {
      const h = single.getBoundingClientRect().height;
      if (h === 0) return;

      const viewportH = getViewportHeight();
      const neededCopiesPerSide = computeCopiesPerSide(h, viewportH);
      const prevH = heightRef.current;
      const copiesChanged = neededCopiesPerSide !== copiesPerSideRef.current;
      const heightChanged = prevH > 0 && Math.abs(h - prevH) >= RESIZE_THRESHOLD;

      if (!readyRef.current) {
        heightRef.current = h;
        copiesPerSideRef.current = neededCopiesPerSide;
        readyRef.current = true;
        lenis.resize();
        if (neededCopiesPerSide !== copiesPerSide) {
          pendingTeleportRef.current = { ratio: 0 };
          setCopiesPerSide(neededCopiesPerSide);
        } else {
          teleport(neededCopiesPerSide * h);
        }
        return;
      }

      if (!copiesChanged && !heightChanged) return;

      // Don't yank scroll position mid-touch — the browser will fight a
      // programmatic scrollTo against a live finger and produce jank.
      // Re-check on touchend instead.
      if (isTouchingRef.current) return;

      const oldCenterStart = copiesPerSideRef.current * prevH;
      const ratio = (l.scroll - oldCenterStart) / prevH;

      heightRef.current = h;

      if (copiesChanged) {
        copiesPerSideRef.current = neededCopiesPerSide;
        pendingTeleportRef.current = { ratio };
        setCopiesPerSide(neededCopiesPerSide); // triggers re-render with new copy count
      } else {
        lenis.resize();
        teleport(neededCopiesPerSide * h + ratio * h);
      }
    };

    const ro = new ResizeObserver(() => scheduleMeasure(measure));
    ro.observe(single);
    scheduleMeasure(measure);

    const onViewportChange = () => scheduleMeasure(measure);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    window.visualViewport?.addEventListener("resize", onViewportChange);

    const onTouchStart = () => {
      isTouchingRef.current = true;
    };
    const onTouchEnd = () => {
      isTouchingRef.current = false;
      scheduleMeasure(measure); // re-check in case a resize landed mid-touch
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (measureRafRef.current !== null) cancelAnimationFrame(measureRafRef.current);
      pendingMeasureRef.current = false;
    };
  }, [lenis, copiesPerSide, teleport, scheduleMeasure]);

  useEffect(() => {
    if (!lenis) return;

    const onScroll = (instance: Lenis) => {
      if (isJumpingRef.current) return;
      const h = heightRef.current;
      if (!h) return;

      const perSide = copiesPerSideRef.current;
      const centerStart = perSide * h;
      const centerEnd = centerStart + h;
      const { scroll } = instance;

      if (scroll < centerStart) {
        teleport(scroll + perSide * h);
      } else if (scroll >= centerEnd) {
        teleport(scroll - perSide * h);
      }
    };

    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis, teleport]);

  const totalCopies = copiesPerSide * 2 + 1;
  const centerIndex = copiesPerSide;

  return (
    <div>
      {Array.from({ length: totalCopies }, (_, i) =>
        i === centerIndex ? (
          <div ref={singleRef} key={i}>
            {children}
          </div>
        ) : (
          <div aria-hidden="true" key={i}>
            {children}
          </div>
        )
      )}
    </div>
  );
}