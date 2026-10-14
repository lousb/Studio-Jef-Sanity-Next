"use client";

import Lenis from "lenis";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type LenisWithJumpFlag = Lenis & { __isProgrammaticJump?: boolean };

const LenisContext = createContext<LenisWithJumpFlag | null>(null);
export const useLenis = () => useContext(LenisContext);

// Coarse pointer + no hover = touch device (phones/tablets), not just a
// narrow window — this avoids misclassifying a resized desktop browser.
function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

const LenisProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenisRef = useRef<LenisWithJumpFlag | null>(null);
  const prevPathname = useRef(pathname);
  const [lenisInstance, setLenisInstance] = useState<LenisWithJumpFlag | null>(null);

  const isStudio = pathname.startsWith("/admin");

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (isStudio) return;

    const mobile = isTouchDevice();

    const lenis = new Lenis(
      mobile
        ? {
            // Mobile: stay close to native scroll feel. syncTouch keeps
            // content tracking the finger 1:1 during the drag itself —
            // the smoothing only kicks in on release, as light extra
            // momentum/settle rather than a full smoothed scroll.
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: false,
            touchMultiplier: 1,
            syncTouch: true,
            // Low lerp = fast, near-instant settle — just enough
            // rounding on release to not feel abrupt, without the
            // rubbery lag a full `duration` tween has on touch.
            syncTouchLerp: 0.075,
  
            lerp: 0.8,
          }
        : {
            duration: 1.2,
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            touchMultiplier: 2,
            syncTouch: true,
            syncTouchLerp: 0.075,
          }
    ) as LenisWithJumpFlag;

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // TEMP (screen recording): add ?autoscroll to the URL for a constant,
    // linear scroll. ?autoscroll=180 sets the speed in px/sec (default 120).
    // Waits 5s, eases up to speed over 2s, then linear forever, never pauses.
    // Delete this block to remove.
    const autoParam = new URLSearchParams(window.location.search).get("autoscroll");
    const autoSpeed = autoParam === null ? 0 : Number(autoParam) || 120;
    const autoStartAt = performance.now() + 5000;
    const AUTO_EASE_MS = 2000;
    let lastTime = 0;
    // Float position we own, so sub-pixel steps accumulate evenly instead of
    // being re-read from the (rounded) real scroll each frame.
    let autoPos: number | null = null;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      if (autoSpeed && time > autoStartAt) {
        const dt = lastTime ? Math.min(time - lastTime, 34) / 1000 : 0;
        // Re-sync if something else moved the page (the infinite loop's
        // seamless wrap jump), then carry on from there at the same speed.
        if (autoPos === null || Math.abs(lenis.scroll - autoPos) > 4) {
          autoPos = lenis.scroll;
        }
        // velocity ramps 0 -> full on a sine curve (no kick at either end)
        const ramp = Math.min((time - autoStartAt) / AUTO_EASE_MS, 1);
        const easedSpeed = autoSpeed * (0.5 - 0.5 * Math.cos(Math.PI * ramp));
        autoPos += easedSpeed * dt;
        lenis.scrollTo(autoPos, { immediate: true, force: true });
      }
      lastTime = time;
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [isStudio]);

  // Only reset scroll on a genuine route change — not on searchParams-only
  // updates (tracking params, filters, soft navs), which caused random
  // scroll-to-0 jumps mid-session on infinite-scroll pages.
  useEffect(() => {
    if (isStudio) return;
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    lenisRef.current?.stop();
    window.scrollTo(0, 0);
    lenisRef.current?.start();
  }, [pathname, searchParams, isStudio]);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
};

export default LenisProvider;