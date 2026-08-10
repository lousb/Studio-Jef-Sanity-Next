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

const LenisProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenisRef = useRef<LenisWithJumpFlag | null>(null);
  const [lenisInstance, setLenisInstance] = useState<LenisWithJumpFlag | null>(null);

  const isStudio = pathname.startsWith("/studio");

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (isStudio) return;

    const lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    }) as LenisWithJumpFlag;

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

  useEffect(() => {
    if (isStudio) return;

    const handleNavigation = () => {
      lenisRef.current?.stop();
      window.scrollTo(0, 0);
      lenisRef.current?.start();
    };

    handleNavigation();
  }, [pathname, searchParams, isStudio]);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
};

export default LenisProvider;