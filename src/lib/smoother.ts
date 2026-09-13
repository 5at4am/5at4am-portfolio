"use client";

import type ScrollSmoother from "gsap/ScrollSmoother";

/**
 * Module-level singleton holding the active ScrollSmoother instance so that
 * fixed, out-of-smooth-content components (the Navbar's OptionWheel) can route
 * programmatic navigation through `smoother.scrollTo()` — the correct way to
 * move the page when the smoother is live — instead of `scrollIntoView`, which
 * GSAP re-points but still fights with the wrapper transform.
 */
export const smootherStore: { current: ScrollSmoother | null } = {
  current: null,
};

/**
 * Smoothly scroll to a section. Uses the smoother's scrollTo when available
 * (falling back to native behavior under reduced-motion / no-smoother) and
 * otherwise a plain scrollIntoView anchor jump.
 */
export function scrollToTarget(idOrEl: string | HTMLElement) {
  const target =
    typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
  if (!target) return;
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const active = smootherStore.current;
  if (active && !reduce) {
    active.scrollTo(target, true, "top top");
    return;
  }
  target.scrollIntoView({
    behavior: reduce ? "auto" : "smooth",
    block: "start",
  });
}
