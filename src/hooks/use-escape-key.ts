"use client";

import { useEffect } from "react";

/**
 * Calls `onEscape` when the user presses Escape. Used to dismiss the mobile
 * navigation panel, which is otherwise dismissible only by tapping a link.
 */
export function useEscapeKey(enabled: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onEscape]);
}
