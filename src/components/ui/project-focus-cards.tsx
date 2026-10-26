"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { ExternalLink } from "@/components/ui/external-link";
import { TagList } from "@/components/ui/tag-list";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { Project } from "@/content/types";

function surfaceFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const a = Math.abs(hash);
  const band = a % 2 === 0 ? [18, 78] : [168, 258];
  const hue = band[0] + (a % 1000) / 1000 * (band[1] - band[0]);
  const angle = a % 360;
  return {
    background: `radial-gradient(140% 160% at 20% 10%, color-mix(in oklab, var(--foreground) 12%, transparent) 0%, transparent 55%),
       radial-gradient(120% 140% at 90% 90%, color-mix(in oklab, var(--foreground) 8%, transparent) 0%, transparent 60%),
       linear-gradient(${angle.toFixed(0)}deg, color-mix(in oklab, var(--card) 96%, var(--foreground) 4%) 0%, var(--card) 100%)`,
    hue,
  };
}

type CardProps = {
  project: Project;
  index: number;
  hovered: number | null;
  setHovered: (index: number | null) => void;
  reduced: boolean;
};

function ProjectCard({ project, index, hovered, setHovered, reduced }: CardProps) {
  const surface = surfaceFor(project.name);
  const isFocused = hovered === index;
  const isBlurred = hovered !== null && hovered !== index;

  return (
    <motion.article
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onFocus={() => setHovered(index)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setHovered(null);
        }
      }}
      tabIndex={0}
      role="group"
      aria-labelledby={`project-title-${index}`}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "group relative flex h-[22rem] w-full cursor-default flex-col overflow-hidden rounded-2xl border border-border/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:h-[26rem]",
        "transition-all duration-300 ease-out",
        isBlurred && !reduced && "scale-[0.98] opacity-60 blur-[1px]",
        isFocused && "shadow-[0_40px_80px_-60px_color-mix(in_oklab,var(--foreground),transparent_40%)]"
      )}
      style={{ background: surface.background }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="relative mt-auto flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
            <h3 id={`project-title-${index}`} className="mt-1 text-lg font-medium text-foreground sm:text-xl">
              {project.name}
            </h3>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {project.tagline}
            </p>
          </div>
        </div>

        <TagList items={project.stack} label={`${project.name} stack`} tone="default" className={cn("transition-opacity duration-300", isFocused ? "opacity-100" : "opacity-80")} />

        <div className={cn("flex flex-wrap gap-x-5 gap-y-2 text-sm transition-opacity duration-300", isFocused ? "opacity-100" : "opacity-80")}>
          {project.links.map((link) => (
            <ExternalLink key={link.href} href={link.href} tone="default">
              {link.label}
            </ExternalLink>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectFocusCards({ projects }: { projects: readonly Project[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && shouldReduceMotion === true;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard key={project.name} project={project} index={index} hovered={hovered} setHovered={setHovered} reduced={reduced} />
      ))}
    </div>
  );
}
