"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  PropsWithChildren,
} from "react";
import { useLenis } from "./LenisProvider";

const SETTLE_MS = 120;
const HEIGHT_TOLERANCE_PX = 0.5;

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function computeCopiesPerSide(itemHeight: number, viewportHeight: number) {
  if (!itemHeight || itemHeight <= 0) return 1;
  return Math.max(1, Math.ceil(viewportHeight / itemHeight) + 4);
}

export interface InfiniteLoopHandle {
  suspend: () => void;
  resume: () => void;
}

export const InfiniteLoop = forwardRef<InfiniteLoopHandle, PropsWithChildren>(
  function InfiniteLoop({ children }, ref) {
    const itemRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const readyRef = useRef(false);
    const lastHeightRef = useRef(0);
    const suspendedRef = useRef(false);
    const [copiesPerSide, setCopiesPerSide] = useState(1);
    const [viewportH, setViewportH] = useState(0);
    const [ready, setReady] = useState(false);

    const lenis = useLenis();

    const withJumpFlag = useCallback(
      (fn: () => void) => {
        if (!lenis) return fn();
        (lenis as any).__isProgrammaticJump = true;
        fn();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            (lenis as any).__isProgrammaticJump = false;
          });
        });
      },
      [lenis]
    );

    const measure = useCallback(() => {
      if (suspendedRef.current) return;

      const item = itemRef.current;
      if (!item || !lenis) return;

      item.style.height = "auto";
      item.style.overflow = "visible";
      const h = item.getBoundingClientRect().height;
      if (h <= 0) return;

      const vh = getViewportHeight();
      setViewportH(vh);

      if (readyRef.current) {
        const oldH = lastHeightRef.current;
        const delta = Math.abs(h - oldH);

        if (delta < HEIGHT_TOLERANCE_PX) {
          containerRef.current?.style.setProperty("--loop-item-h", `${oldH}px`);
          return;
        }

        withJumpFlag(() => {
          lenis.stop();
          containerRef.current?.style.setProperty("--loop-item-h", `${h}px`);

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              lenis.resize();
              const currentScroll = lenis.scroll;
              const ratio = h / oldH;
              const targetScroll = Math.round(currentScroll * ratio);
              lenis.scrollTo(targetScroll, { immediate: true, force: true });
              lenis.start();
            });
          });
        });

        lastHeightRef.current = h;
        return;
      }

      containerRef.current?.style.setProperty("--loop-item-h", `${h}px`);

      const needed = computeCopiesPerSide(h, vh);
      if (needed !== copiesPerSide) {
        setCopiesPerSide(needed);
        return;
      }

      withJumpFlag(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            lenis.resize();
            lenis.scrollTo(needed * h, { immediate: true, force: true });
            lastHeightRef.current = h;
            readyRef.current = true;
            setReady(true);
          });
        });
      });
    }, [lenis, copiesPerSide, withJumpFlag]);

    // --- suspend/resume: dedicated, no ratio-scroll math ---

    const suspend = useCallback(() => {
      suspendedRef.current = true;
      // Hard freeze — stop Lenis immediately so nothing can scroll while the
      // CSS width/alignment transition plays out. We deliberately do NOT try
      // to compensate for the transition's own resize activity: a view toggle
      // keeps the same images in frame, so there's nothing to compensate for.
      lenis?.stop();
    }, [lenis]);

    const resume = useCallback(() => {
      suspendedRef.current = false;

      const item = itemRef.current;
      if (!item || !lenis) return;

      item.style.height = "auto";
      item.style.overflow = "visible";
      const h = item.getBoundingClientRect().height;

      if (h > 0) {
        containerRef.current?.style.setProperty("--loop-item-h", `${h}px`);
        lastHeightRef.current = h;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis.resize();
          // Re-sync Lenis's internal scroll target to the ACTUAL current
          // position. After stop() -> resize(), Lenis's cached target can
          // drift from real scrollY (limits changed under it while stopped).
          // Starting without this resync leaves it lerping toward a stale
          // target, which clamps future scroll short of the real DOM edge —
          // that's what was cutting the infinite-loop buffer short.
          lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
          lenis.start();
        });
      });
    }, [lenis]);

    useImperativeHandle(ref, () => ({ suspend, resume }), [suspend, resume]);

    useLayoutEffect(() => {
      const container = containerRef.current;
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      const imgs = container ? Array.from(container.querySelectorAll("img")) : [];
      const imagesReady = Promise.all(
        imgs.map(
          (img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((res) => {
                  img.addEventListener("load", () => res(), { once: true });
                  img.addEventListener("error", () => res(), { once: true });
                })
        )
      );
      Promise.all([fontsReady, imagesReady]).then(measure);
    }, [measure]);

    useEffect(() => {
      if (!itemRef.current) return;
      const scheduleMeasure = () => {
        if (settleTimer.current) clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(measure, SETTLE_MS);
      };
      const ro = new ResizeObserver(scheduleMeasure);
      ro.observe(itemRef.current);
      window.addEventListener("resize", scheduleMeasure);
      window.addEventListener("orientationchange", scheduleMeasure);
      window.visualViewport?.addEventListener("resize", scheduleMeasure);
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", scheduleMeasure);
        window.removeEventListener("orientationchange", scheduleMeasure);
        window.visualViewport?.removeEventListener("resize", scheduleMeasure);
        if (settleTimer.current) clearTimeout(settleTimer.current);
      };
    }, [measure]);

    const totalCopies = copiesPerSide * 2 + 1;
    const centerIndex = copiesPerSide;
    const lastIndex = totalCopies - 1;

    const naturalStyle = {
      height: "var(--loop-item-h)",
      overflow: "hidden" as const,
      overflowAnchor: "none" as const,
    };


    const wrapSeamStyle = {
      height: "var(--loop-item-h)",
      maxHeight: viewportH ? `${viewportH}px` : "100dvh",
      overflow: "hidden" as const,
      overflowAnchor: "none" as const,
    };

    return (
      <div ref={containerRef} style={{ visibility: ready ? "visible" : "hidden", overflowAnchor: "none" }}>
        {Array.from({ length: totalCopies }, (_, i) => {
          if (i === centerIndex) {
            return (
              <div ref={itemRef} key={i} style={naturalStyle}>
                {children}
              </div>
            );
          }
          const style = i === lastIndex ? wrapSeamStyle : naturalStyle;
          return (
            <div aria-hidden="true" key={i} style={{ ...style }}>
              {children}
            </div>
          );
        })}
      </div>
    );
  }
);