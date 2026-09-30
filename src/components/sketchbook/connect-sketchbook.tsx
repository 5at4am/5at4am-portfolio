"use client";

import { useEffect, useRef, useState } from "react";

import { Sketchbook } from "@/shaders/sketchbook/Sketchbook";
import { cn } from "@/lib/utils";

export type ConnectSketchbookProps = {
  className?: string;
};

/**
 * Lazy wrapper around the WebGL sketchbook.
 *
 * The canvas is only mounted once the host scrolls near the viewport, so the
 * Three.js bundle and its textures never load for visitors who do not reach
 * this section. A `visibilitychange` fallback mounts it on tab focus in case
 * the observer never fires (e.g. prerendered/hidden tab).
 *
 * A translucent scrim sits above the canvas so the illustration stays
 * subordinate to the surrounding copy.
 */
export function ConnectSketchbook({ className }: ConnectSketchbookProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setMounted(true);
      },
      { rootMargin: "200px" }
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mounted) return;

    const onVisibility = () => {
      if (!document.hidden) setMounted(true);
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [mounted]);

  return (
    <div
      ref={hostRef}
      className={cn(
        "relative overflow-hidden rounded-sm border border-border bg-muted",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-background/45"
      />
      {mounted ? (
        <div className="h-72 opacity-70 saturate-[0.85] transition-opacity duration-500 sm:h-80 lg:h-96">
          <Sketchbook assetBaseUrl="/sketchbook/" />
        </div>
      ) : (
        <div className="h-72 sm:h-80 lg:h-96" />
      )}
    </div>
  );
}
