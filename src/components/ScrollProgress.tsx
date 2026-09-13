"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollProgress - a fixed progress bar at the very top of the viewport that
 * scales 0 -> 1 with scroll position, scrubbed by GSAP (so it tracks the
 * ScrollSmoother's eased position, not the raw jumpy native scroll).
 *
 * Sits outside #smooth-wrapper (same as the Navbar) so it stays truly fixed.
 * Renders an empty bar under prefers-reduced-motion.
 */
export default function ScrollProgress() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-progress-bar]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      ref={rootRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      <div
        data-progress-bar
        className="h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-accent via-accent-warm to-accent-deep"
      />
      <div
        data-progress-bar
        className="-mt-[2px] h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 blur-[6px]"
      />
    </div>
  );
}