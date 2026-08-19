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
const ITEM_GAP_PX = 10; // structural gap between clones — keep in sync with marginBottom below
const START_OFFSET_PX = 0; // manual fine-tune knob — nudge until scroll lands exactly at visual top

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
  scrollToStart: () => boolean;
}

export const InfiniteLoop = forwardRef<InfiniteLoopHandle, PropsWithChildren>(
  function InfiniteLoop({ children }, ref) {
    const itemRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const readyRef = useRef(false);
    const lastHeightRef = useRef(0);
    const suspendedRef = useRef(false);
    const containerTopRef = useRef(0);
    const isWrappingRef = useRef(false);
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

    // Tracks where the loop container's top sits in absolute Lenis-scroll
    // coordinates. The wrap-around scroll handler needs this to convert
    // lenis.scroll (document-relative) into a position local to the loop,
    // since the loop may not start at scroll = 0 (e.g. title/meta content
    // above it).
    const updateContainerTop = useCallback(() => {
      if (!containerRef.current || !lenis) return;
      containerTopRef.current =
        containerRef.current.getBoundingClientRect().top + lenis.scroll;
    }, [lenis]);

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
              updateContainerTop();
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
            lenis.scrollTo(needed * (h + ITEM_GAP_PX) + START_OFFSET_PX, { immediate: true, force: true });
            lastHeightRef.current = h;
            readyRef.current = true;
            setReady(true);
            updateContainerTop();
          });
        });
      });
    }, [lenis, copiesPerSide, withJumpFlag, updateContainerTop]);

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
          updateContainerTop();
        });
      });
    }, [lenis, updateContainerTop]);

    // Returns true once it actually moved scroll to the real start position;
    // false if InfiniteLoop isn't ready/measured yet, so callers know to retry.
    const scrollToStart = useCallback((): boolean => {
      if (!lenis || !readyRef.current) return false;
      const h = lastHeightRef.current;
      if (!h) return false;

      withJumpFlag(() => {
        lenis.scrollTo(copiesPerSide * (h + ITEM_GAP_PX) + START_OFFSET_PX, { immediate: true, force: true });
      });
      return true;
    }, [lenis, copiesPerSide, withJumpFlag]);

    useImperativeHandle(
      ref,
      () => ({ suspend, resume, scrollToStart }),
      [suspend, resume, scrollToStart]
    );

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

    // --- wrap-around: the actual "infinite" part ---
    //
    // The duplicated copies above/below the center item only give a FINITE
    // buffer before hitting the real top/bottom of the document. Without
    // this, fast scrolling (iOS momentum flicks especially, but also fast
    // wheel/trackpad deltas on desktop) can outrun the buffer and hit the
    // real scroll boundary — which reads as "it stops at the top/bottom."
    //
    // This watches Lenis's scroll position and, once you get within one
    // viewport of either end, silently jumps forward/back by an exact
    // multiple of the item spacing (item height + gap). Because every copy
    // is identical content, a jump of copiesPerSide * (itemHeight + gap)
    // lands on pixel-identical content, so the jump is visually undetectable.
    // NOTE: intentionally does NOT use START_OFFSET_PX — that offset only
    // applies to the initial/reset position, adding it here would break the
    // exact-multiple math and cause a visible snap on wrap.
    useEffect(() => {
      if (!lenis || !ready) return;

      const handleScroll = () => {
        if (suspendedRef.current || isWrappingRef.current) return;

        const h = lastHeightRef.current;
        if (!h) return;

        const vh = getViewportHeight();
        const totalH = (h + ITEM_GAP_PX) * (copiesPerSide * 2 + 1) - ITEM_GAP_PX;
        const maxLocal = totalH - vh;
        const localScroll = lenis.scroll - containerTopRef.current;

        const jumpDistance = copiesPerSide * (h + ITEM_GAP_PX); // multiple of item spacing = seamless
        const threshold = Math.max(vh, h); // trigger a full viewport early

        if (localScroll < threshold) {
          isWrappingRef.current = true;
          withJumpFlag(() => {
            lenis.scrollTo(lenis.scroll + jumpDistance, {
              immediate: true,
              force: true,
            });
          });
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              isWrappingRef.current = false;
            })
          );
        } else if (localScroll > maxLocal - threshold) {
          isWrappingRef.current = true;
          withJumpFlag(() => {
            lenis.scrollTo(lenis.scroll - jumpDistance, {
              immediate: true,
              force: true,
            });
          });
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              isWrappingRef.current = false;
            })
          );
        }
      };

      lenis.on("scroll", handleScroll);
      return () => {
        lenis.off("scroll", handleScroll);
      };
    }, [lenis, ready, copiesPerSide, withJumpFlag]);

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
      <div
        ref={containerRef}
        style={{ visibility: ready ? "visible" : "hidden", overflowAnchor: "none" }}
      >
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
            <div aria-hidden="true" key={i} style={{ ...style, marginBottom: `${ITEM_GAP_PX}px` }}>
              {children}
            </div>
          );
        })}
      </div>
    );
  }
);