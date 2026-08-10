// CursorLabel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface CursorLabelProps {
  text: string;
  active: boolean;
}

export function CursorLabel({ text, active }: CursorLabelProps) {
  const labelRef = useRef<HTMLDivElement>(null);
  const quickX = useRef<gsap.QuickToFunc | null>(null);
  const quickY = useRef<gsap.QuickToFunc | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!labelRef.current) return;

    // set the centering offset once, as part of GSAP's own transform —
    // NOT as a separate inline style, or quickTo below will overwrite it
    gsap.set(labelRef.current, { xPercent: 0, yPercent: -240 });

    quickX.current = gsap.quickTo(labelRef.current, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    quickY.current = gsap.quickTo(labelRef.current, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    const onMove = (e: MouseEvent) => {
      if (!mounted) setMounted(true);
      quickX.current?.(e.clientX);
      quickY.current?.(e.clientY);
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mounted]);

  return (
    <div
      ref={labelRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        color: "#fff",
        whiteSpace: "nowrap",
        opacity: active && mounted ? 1 : 0,
        transition: "opacity 0.25s ease",
        zIndex: 99,
        mixBlendMode: "difference",
      }}
    >
      {text}
    </div>
  );
}