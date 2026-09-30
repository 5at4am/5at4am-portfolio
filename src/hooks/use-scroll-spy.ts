"use client";

import { useEffect, useState } from "react";

const SCROLLED_THRESHOLD = 8;

export type ScrollSpyState = {
  /** Id of the section currently under the header, or the first section. */
  activeId: string;
  /** True once the page has scrolled past the hero, for the header border. */
  isScrolled: boolean;
};

/**
 * Tracks which anchor section is in view so the header can highlight it.
 *
 * Measurements are rAF-throttled and batched into a single scroll handler, so
 * a fast scroll does not cause layout thrashing. When the page is scrolled to
 * the very bottom the last section always wins, otherwise a short trailing
 * section (e.g. a brief contact block) could never become active.
 *
 * `sectionIds` may be a fresh array on every render; the effect keys off the
 * joined ids, not the array identity.
 */
export function useScrollSpy(
  sectionIds: readonly string[],
  offset: number
): ScrollSpyState {
  const idsKey = sectionIds.join("|");
  const [state, setState] = useState<ScrollSpyState>(() => ({
    activeId: sectionIds[0] ?? "",
    isScrolled: false,
  }));

  useEffect(() => {
    const ids = idsKey ? idsKey.split("|") : [""];
    const firstId = ids[0] ?? "";
    const lastId = ids[ids.length - 1] ?? firstId;
    let frame = 0;

    const measure = () => {
      frame = 0;

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      let current = firstId;
      if (atBottom) {
        current = lastId;
      } else {
        for (const id of ids) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top - offset <= 0) {
            current = id;
          }
        }
      }

      const isScrolled = window.scrollY > SCROLLED_THRESHOLD;
      setState((prev) =>
        prev.activeId === current && prev.isScrolled === isScrolled
          ? prev
          : { activeId: current, isScrolled }
      );
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [idsKey, offset]);

  return state;
}
