"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback } from "react";

import { BulletList } from "@/components/ui/bullet-list";
import { TagList } from "@/components/ui/tag-list";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { ExperienceItem } from "@/content/types";

const ENTER_SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };

function SpotlightCard({
  children,
  className,
  reduced,
}: {
  children: React.ReactNode;
  className?: string;
  reduced: boolean;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback(
    ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
      if (reduced) return;
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY, reduced]
  );

  return (
    <motion.article
      onMouseMove={handleMouseMove}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={reduced ? { duration: 0 } : ENTER_SPRING}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors duration-300 hover:border-foreground/20 sm:p-6",
        className
      )}
    >
      {!reduced && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                360px circle at ${mouseX}px ${mouseY}px,
                rgba(255, 255, 255, 0.05),
                transparent 80%
              )
            `,
          }}
        />
      )}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </motion.article>
  );
}

function ExperienceCard({ item, index, reduced }: { item: ExperienceItem; index: number; reduced: boolean }) {
  return (
    <SpotlightCard reduced={reduced}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-lg font-medium text-foreground sm:text-xl">{item.role}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.org} · {item.meta}
          </p>
        </div>
        <span className="rounded-full border border-border/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {item.outcome}
        </span>
      </div>

      <BulletList items={item.bullets} className="mt-5 text-sm text-muted-foreground" />

      <TagList items={item.stack} label={`${item.role} stack`} tone="default" className="mt-5" />
    </SpotlightCard>
  );
}

export function ExperienceCards({ items }: { items: readonly ExperienceItem[] }) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && reduceMotion === true;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {items.map((item, index) => (
        <ExperienceCard key={`${item.role}-${item.org}`} item={item} index={index} reduced={reduced} />
      ))}
    </div>
  );
}
