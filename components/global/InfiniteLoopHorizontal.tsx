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

const SETTLE_MS = 120;
const WIDTH_TOLERANCE_PX = 0.5;

function computeCopiesPerSide(itemWidth: number, containerWidth: number) {
  if (!itemWidth || itemWidth <= 0) return 1;
  return Math.max(1, Math.ceil(containerWidth / itemWidth) + 2);
}

export interface InfiniteLoopHorizontalHandle {
  suspend: () => void;
  resume: () => void;
}

export const InfiniteLoopHorizontal = forwardRef<
  InfiniteLoopHorizontalHandle,
  PropsWithChildren
>(function InfiniteLoopHorizontal({ children }, ref) {
  const itemRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readyRef = useRef(false);
  const lastWidthRef = useRef(0);
  const suspendedRef = useRef(false);
  const isWrappingRef = useRef(false);
  const [copiesPerSide, setCopiesPerSide] = useState(1);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    if (suspendedRef.current) return;

    const item = itemRef.current;
    const scroller = scrollerRef.current;
    if (!item || !scroller) return;

    item.style.width = "auto";
    const w = item.getBoundingClientRect().width;
    if (w <= 0) return;

    const cw = scroller.clientWidth;

    if (readyRef.current) {
      const oldW = lastWidthRef.current;
      const delta = Math.abs(w - oldW);

      if (delta < WIDTH_TOLERANCE_PX) {
        scroller.style.setProperty("--loop-item-w", `${oldW}px`);
        return;
      }

      isWrappingRef.current = true;
      scroller.style.setProperty("--loop-item-w", `${w}px`);
      requestAnimationFrame(() => {
        const ratio = w / oldW;
        scroller.scrollLeft = Math.round(scroller.scrollLeft * ratio);
        lastWidthRef.current = w;
        requestAnimationFrame(() => {
          isWrappingRef.current = false;
        });
      });
      return;
    }

    scroller.style.setProperty("--loop-item-w", `${w}px`);

    const needed = computeCopiesPerSide(w, cw);
    if (needed !== copiesPerSide) {
      setCopiesPerSide(needed);
      return;
    }

    isWrappingRef.current = true;
    requestAnimationFrame(() => {
      scroller.scrollLeft = needed * w;
      lastWidthRef.current = w;
      readyRef.current = true;
      setReady(true);
      requestAnimationFrame(() => {
        isWrappingRef.current = false;
      });
    });
  }, [copiesPerSide]);

  const suspend = useCallback(() => {
    suspendedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    suspendedRef.current = false;
    const item = itemRef.current;
    const scroller = scrollerRef.current;
    if (!item || !scroller) return;

    item.style.width = "auto";
    const w = item.getBoundingClientRect().width;
    if (w > 0) {
      scroller.style.setProperty("--loop-item-w", `${w}px`);
      lastWidthRef.current = w;
    }
  }, []);

  useImperativeHandle(ref, () => ({ suspend, resume }), [suspend, resume]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const imgs = scroller ? Array.from(scroller.querySelectorAll("img")) : [];
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
    imagesReady.then(measure);

    // Safety net: force ready after 1.5s even if measurement stalled,
    // so the strip never stays permanently hidden.
    const fallback = setTimeout(() => {
      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    }, 1500);
    return () => clearTimeout(fallback);
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
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("orientationchange", scheduleMeasure);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [measure]);

  // --- wrap-around ---
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !ready) return;

    const handleScroll = () => {
      if (suspendedRef.current || isWrappingRef.current) return;

      const w = lastWidthRef.current;
      if (!w) return;

      const cw = scroller.clientWidth;
      const totalW = w * (copiesPerSide * 2 + 1);
      const maxScroll = totalW - cw;
      const jumpDistance = copiesPerSide * w;
      const threshold = Math.max(cw, w);

      if (scroller.scrollLeft < threshold) {
        isWrappingRef.current = true;
        scroller.scrollLeft += jumpDistance;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            isWrappingRef.current = false;
          })
        );
      } else if (scroller.scrollLeft > maxScroll - threshold) {
        isWrappingRef.current = true;
        scroller.scrollLeft -= jumpDistance;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            isWrappingRef.current = false;
          })
        );
      }
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [ready, copiesPerSide]);

  const totalCopies = copiesPerSide * 2 + 1;
  const centerIndex = copiesPerSide;

  const itemStyle = {
    width: "var(--loop-item-w)",
    flex: "0 0 auto" as const,
  };

  return (
   <div
     ref={scrollerRef}
     className="no-scrollbar flex overflow-x-auto snap-x snap-proximity infinite-loop-h"
     style={{
       visibility: ready ? "visible" : "hidden",
       WebkitOverflowScrolling: "touch",
       touchAction: "pan-x",
       scrollbarWidth: "none",
       overflowAnchor: "none",
     }}
   >
      {Array.from({ length: totalCopies }, (_, i) =>
        i === centerIndex ? (
          <div ref={itemRef} key={i} style={itemStyle} className="flex snap-start">
            {children}
          </div>
        ) : (
          <div aria-hidden="true" key={i} style={itemStyle} className="flex snap-start">
            {children}
          </div>
        )
      )}
    </div>
  );
});