"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  PropsWithChildren,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

  const isStudio = pathname.startsWith("/studio");

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

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
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