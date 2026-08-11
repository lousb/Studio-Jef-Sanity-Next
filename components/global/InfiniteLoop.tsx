"use client";

import { useEffect, useRef, useState, useCallback, PropsWithChildren } from "react";
import { useLenis } from "./LenisProvider";
import type Lenis from "lenis";

type LenisInternals = Lenis & {
  animatedScroll: number;
  targetScroll: number;
  __isProgrammaticJump?: boolean;
};

// Ignore layout deltas smaller than this — sub-pixel rounding noise.
const RESIZE_THRESHOLD = 2;

// A measured size has to stay put for this long before we act on it.
// Mobile Safari/Chrome fire several resize events in a row while the
// address bar animates in/out — react to the settled size, not every
// intermediate frame, or you get a correction mid-scroll.
const SETTLE_MS = 120;

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

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
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

    const animated = Number.isFinite(l.animatedScroll) ? l.animatedScroll : (l.scroll ?? 0);
    const target = Number.isFinite(l.targetScroll) ? l.targetScroll : animated;
    const pending = Number.isFinite(target - animated) ? target - animated : 0;

    l.scrollTo(pos, { immediate: true, force: true });
    l.targetScroll = pos + pending;

    requestAnimationFrame(() => {
      // only the most recent jump releases the lock
      if (jumpTokenRef.current !== token) return;
      isJumpingRef.current = false;
      l.__isProgrammaticJump = false;
    });
  }, []);

  // Debounced measure: waits for size to stop changing before reacting.
  // Pass immediate=true for the very first measurement on mount.
  const scheduleMeasure = useCallback((fn: () => void, immediate = false) => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    if (immediate) {
      fn();
      return;
    }
    settleTimerRef.current = setTimeout(fn, SETTLE_MS);
  }, []);

  useEffect(() => {
    if (!lenis || !singleRef.current) return;
    const l = lenis as LenisInternals;
    const single = singleRef.current;

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

      // Never yank scroll position while a finger is down — the browser
      // (or Lenis' own momentum) will fight a programmatic scrollTo and
      // it shows up as a stutter. The debounce below re-checks once
      // touch and resize activity both go quiet.
      if (isTouchingRef.current) return;

      const oldCenterStart = copiesPerSideRef.current * prevH;
      const ratio = prevH > 0 ? (l.scroll - oldCenterStart) / prevH : 0;

      heightRef.current = h;

      if (copiesChanged) {
        copiesPerSideRef.current = neededCopiesPerSide;
        pendingTeleportRef.current = { ratio };
        setCopiesPerSide(neededCopiesPerSide);
      } else {
        lenis.resize();
        teleport(neededCopiesPerSide * h + ratio * h);
      }
    };

    const ro = new ResizeObserver(() => scheduleMeasure(measure));
    ro.observe(single);
    scheduleMeasure(measure, true); // first pass runs immediately, no debounce

    const onViewportChange = () => scheduleMeasure(measure);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    window.visualViewport?.addEventListener("resize", onViewportChange);

    const onTouchStart = () => {
      isTouchingRef.current = true;
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };
    const onTouchEnd = () => {
      isTouchingRef.current = false;
      scheduleMeasure(measure); // re-check once things settle
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
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
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