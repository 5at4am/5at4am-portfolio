"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { ThreeDPaperVariant } from "@/shaders/3d-paper/ThreeDPaper";

export type ConnectThreeDPaperProps = {
  variant?: ThreeDPaperVariant;
  className?: string;
};

/**
 * Matches the document background the vendored 3D Paper renders against
 * (`--bg:#08080a`), so the placeholder, the frame edge, and the paper itself
 * read as one surface while the module is still loading.
 */
const PAPER_VOID = "#08080a";

/**
 * The vendored component ships four complete 630 KB documents, all imported as
 * raw strings. Loading it through `next/dynamic` keeps them out of the route
 * chunk so they are only fetched once the section is actually reached, and
 * `ssr: false` keeps them out of the server-rendered payload entirely.
 */
const ThreeDPaper = dynamic(
  () => import("@/shaders/3d-paper/ThreeDPaper").then((mod) => mod.ThreeDPaper),
  { ssr: false, loading: () => null }
);

/**
 * Lazy, visibility-aware host for the ThreeUI 3D Paper document.
 *
 * The document is mounted only once the frame is near the viewport, so the
 * Three.js r149 bundle, the procedural textures, and the WebGL context are
 * never created for a visitor who scrolls past. A `visibilitychange` fallback
 * covers the case where the observer never fires, such as a prerendered tab
 * that is already focused.
 *
 * Sizing and visibility of the frame itself belong to the caller: the
 * component's root fills its parent and the document frames itself from the
 * iframe viewport, so an aspect ratio on this element is the only thing needed
 * to keep canvas dimensions and the responsive framing correct.
 */
export function ConnectThreeDPaper({
  variant = "original",
  className,
}: ConnectThreeDPaperProps) {
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
        "relative w-full overflow-hidden rounded-sm border border-neutral-800",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: PAPER_VOID }}
      />
      {mounted ? (
        <ThreeDPaper
          variant={variant}
          className="block h-full w-full"
        />
      ) : null}
    </div>
  );
}
