"use client";

import { useScroll, useTransform, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Award, BadgeCheck, Trophy } from "lucide-react";

import { ExternalLink } from "@/components/ui/external-link";
import { cn } from "@/lib/utils";
import type { Award as AwardType } from "@/content/types";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

function getIcon(scope?: string) {
  if (scope === "team") return Trophy;
  return BadgeCheck;
}

export function AchievementsTimelineAceternity({ awards }: { awards: readonly AwardType[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const data: TimelineEntry[] = awards.map((award) => {
    const Icon = getIcon(award.scope);
    return {
      title: award.date || award.issuer || award.org,
      content: (
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon className="size-3.5 text-foreground/70" />
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {award.issuer ?? award.org}
                </p>
              </div>
              <h3 className="mt-2 text-lg font-medium text-foreground sm:text-xl">{award.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{award.org}</p>
            </div>
            {award.scope === "team" ? (
              <span className="rounded-full border border-border/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Team Award
              </span>
            ) : (
              <span className="rounded-full border border-border/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                Certification
              </span>
            )}
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-6 text-xs text-muted-foreground">
            {award.date ? <span className="tabular-nums">{award.date}</span> : null}
            {award.credentialId ? <span className="tabular-nums">ID {award.credentialId}</span> : null}
            {award.href ? (
              <ExternalLink href={award.href} className="font-mono text-xs">
                Verify
              </ExternalLink>
            ) : null}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="w-full" ref={containerRef}>
      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:gap-10 md:pt-40"
          >
            <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full lg:max-w-sm">
              <div className="absolute left-3 h-10 w-10 rounded-full bg-background md:left-3">
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-300 bg-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800" />
              </div>
              <h3 className="hidden text-xl font-bold text-neutral-500 md:block md:pl-20 md:text-5xl dark:text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <h3 className="mb-4 block text-left text-2xl font-bold text-neutral-500 md:hidden dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8 dark:via-neutral-700"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-foreground/60 via-foreground/30 to-transparent from-[0%] via-[10%]"
          />
        </div>
      </div>
    </div>
  );
}
