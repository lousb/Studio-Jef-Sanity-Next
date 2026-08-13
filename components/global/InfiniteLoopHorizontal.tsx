"use client";

import useEmblaCarousel from "embla-carousel-react";
import { PropsWithChildren } from "react";

export function InfiniteLoopHorizontal({ children }: PropsWithChildren) {
  const [emblaRef] = useEmblaCarousel({
    loop: true,
    dragFree: true,      // lighter, momentum-based feel vs snap-to-slide
    align: "start",
    containScroll: false, // required for loop:true to work correctly
  });

  return (
    <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
      <div className="flex touch-pan-x ">
        {children}
      </div>
    </div>
  );
}