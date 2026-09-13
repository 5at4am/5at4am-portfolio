"use client";

import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";
import { smootherStore } from "@/lib/smoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Resize events on mobile fire scroll-jitter (address bar collapse); ignore
// the factor changes that aren't real layout changes.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * SmoothScroll — GSAP ScrollSmoother (free since GSAP 3.13; this project is on
 * 3.15, so no Club membership is required).
 *
 * Wraps scrollable page content in the classic
 *   `#smooth-wrapper > #smooth-content`
 * anatomy and drives it with `ScrollSmoother.create(...)`. GSAP preserves
 * native scroll (it inflates body height and translates content for a buttery
 * feel), so:
 *   - the fixed Navbar (outside this wrapper) keeps its fixed positioning;
 *   - OptionWheel / navbar scrolls route through `smoother.scrollTo()` via the
 *     `smootherStore` singleton (see @/lib/smoother);
 *   - existing ScrollTriggers (WordReveal, ScrollExpand hero pin), whose
 *     scroller is `window` (created automatically by the checker) get
 *     re-pointed to the wrapper when the smoother is created — the documented
 *     React child-before-parent case.
 *
 * Guards:
 * - prefers-reduced-motion: skipped entirely (native instant scroll).
 * - SSR: renders children inside the wrapper on the server; the smoother is
 *   created only on the client (after mount), never on the server.
 * - Cleanup: kills the smoother + refreshes triggers on unmount so HMR/route
 *   changes never leave a stale pinned/scrubbed state.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;

    // Skip entirely under reduced motion (native scroll).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const smoother = ScrollSmoother.create({
      wrapper,
      content,
      smooth: 1.4,
      effects: true, // enables data-speed / data-lag parallax layers
      smoothTouch: 0.1,
    });

    smootherStore.current = smoother;

    // Re-measure trigger positions once webfonts finish loading (font swap
    // changes layout heights and would leave pinned/scrubbed tweens misaligned).
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      smootherStore.current = null;
      smoother.kill();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        {children}
      </div>
    </div>
  );
}
