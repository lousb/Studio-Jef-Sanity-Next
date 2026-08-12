"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback, PropsWithChildren } from "react";
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

export function InfiniteLoop({ children }: PropsWithChildren) {
  const itemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyRef = useRef(false);
  const lastHeightRef = useRef(0);
  const [copiesPerSide, setCopiesPerSide] = useState(1);
  const [viewportH, setViewportH] = useState(0);
  const [ready, setReady] = useState(false);

  const lenis = useLenis();

  const withJumpFlag = useCallback((fn: () => void) => {
    if (!lenis) return fn();
    (lenis as any).__isProgrammaticJump = true;
    fn();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        (lenis as any).__isProgrammaticJump = false;
      });
    });
  }, [lenis]);

  const measure = useCallback(() => {
    const item = itemRef.current;
    if (!item || !lenis) return;

    // Measure the real item's natural height, releasing any prior clamp
    // first so we're reading true content height each time.
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

  useLayoutEffect(() => {
    const container = containerRef.current;
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const imgs = container ? Array.from(container.querySelectorAll("img")) : [];
    const imagesReady = Promise.all(
      imgs.map((img) =>
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

  // Normal copies: natural content height (via the measured CSS var).
  const naturalStyle = {
    height: "var(--loop-item-h)",
    overflow: "hidden" as const,
  };

  // The final duplicate before the wrap point only: capped at one
  // viewport, clipped (not stretched) so short content is untouched
  // and tall content shows just its top slice — matching the exact
  // frame visible at scroll:0 on first load, so the teleport lands
  // on a visually identical frame.
  const wrapSeamStyle = {
    height: "var(--loop-item-h)",
    maxHeight: viewportH ? `${viewportH}px` : "100dvh",
    overflow: "hidden" as const,
  };

  return (
    <div ref={containerRef} style={{ visibility: ready ? "visible" : "hidden" }}>
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
          <div aria-hidden="true" key={i} style={{ ...style, pointerEvents: "none" }}>
            {children}
          </div>
        );
      })}
    </div>
  );
}