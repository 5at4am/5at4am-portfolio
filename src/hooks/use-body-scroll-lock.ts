"use client";

import { useEffect } from "react";

/**
 * Prevents the page behind a modal/panel from scrolling, restoring the
 * previous `overflow` value on close so nested usage cannot strand the body
 * in a locked state.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
