"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollExpand - pins the section at the viewport top and expands the
 * [data-expand] child (the hero visual) from 0.72 to 1 as the user scrolls.
 * The text around it stays put; only the visual grows. Falls back to a
 * static render under prefers-reduced-motion.
 *
 * Usage:
 *   <ScrollExpand>
 *     <div className="grid ...">
 *       <div>text</div>
 *       <div data-expand>image</div>
 *     </div>
 *   </ScrollExpand>
 */
export default function ScrollExpand({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const target = ref.current!.querySelector("[data-expand]");
      if (!target) return;
      gsap.fromTo(
        target,
        { scale: 0.72, opacity: 0.5 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            pin: true,
            scrub: true,
            // Pre-cushions the start/end of the pin so the smoother doesn't
            // jerk on the sudden fixed-position handoff.
            anticipatePin: 1,
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}