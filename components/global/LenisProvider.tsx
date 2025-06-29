"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PropsWithChildren } from "react";

const LenisProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis instance
    const lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy(); // Clean up Lenis instance
    };
  }, []);

  useEffect(() => {
    // Handle navigation changes
    const handleNavigation = () => {
      if (lenisRef.current) {
        lenisRef.current.stop(); // Stop Lenis during navigation
      }
      window.scrollTo(0, 0); // Reset scroll position to the top
      if (lenisRef.current) {
        lenisRef.current.start(); // Restart Lenis after navigation
      }
    };

    handleNavigation();
  }, [pathname, searchParams]);

  return <>{children}</>;
};

export default LenisProvider;