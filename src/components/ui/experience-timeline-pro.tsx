"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";

import { BulletList } from "@/components/ui/bullet-list";
import { TagList } from "@/components/ui/tag-list";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { ExperienceItem } from "@/content/types";

const ENTER_SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };

function TimelineEntry({
  item,
  index,
  reduced,
}: {
  item: ExperienceItem;
  index: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "start 0.4"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-[auto_1fr] gap-x-4 pb-12 last:pb-0 sm:gap-x-8"
    >
      <div className="relative flex flex-col items-center">
        <div className="sticky top-28 flex flex-col items-center">
          <motion.div
            initial={reduced ? false : { scale: 0.6, opacity: 0 }}
            whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={reduced ? { duration: 0 } : { ...ENTER_SPRING, delay: index * 0.04 }}
            className="relative flex size-10 items-center justify-center rounded-full border border-border/70 bg-card/60"
          >
            <span className="absolute inline-flex size-2 rounded-full bg-foreground" />
            <span className="absolute inline-flex size-6 animate-pulse rounded-full bg-foreground/10" />
          </motion.div>
          <div className="mt-4 h-full w-px bg-gradient-to-b from-foreground/20 to-transparent" />
        </div>
      </div>

      <motion.article
        style={reduced ? undefined : { opacity, scale }}
        initial={reduced ? { opacity: 1 } : undefined}
        className={cn(
          "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 sm:p-7"
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {item.meta}
            </p>
            <h3 className="mt-2 text-xl font-medium text-foreground sm:text-2xl">{item.role}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.org}</p>
          </div>
          <span className="rounded-full border border-border/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            {item.outcome}
          </span>
        </div>

        <BulletList items={item.bullets} className="mt-6 text-sm leading-relaxed text-muted-foreground" />
        <TagList items={item.stack} label={`${item.role} stack`} tone="default" className="mt-6" />
      </motion.article>
    </div>
  );
}

export function ExperienceTimelinePro({ items }: { items: readonly ExperienceItem[] }) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && reduceMotion === true;

  return (
    <div className="relative">
      {items.map((item, index) => (
        <TimelineEntry key={`${item.role}-${item.org}`} item={item} index={index} reduced={reduced} />
      ))}
    </div>
  );
}
