"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback } from "react";

import { ExternalLink } from "@/components/ui/external-link";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { Award } from "@/content/types";

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
    <motion.div
      onMouseMove={handleMouseMove}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
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
                320px circle at ${mouseX}px ${mouseY}px,
                rgba(255, 255, 255, 0.05),
                transparent 80%
              )
            `,
          }}
        />
      )}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </motion.div>
  );
}

function AchievementCard({ award, reduced }: { award: Award; reduced: boolean }) {
  return (
    <SpotlightCard reduced={reduced} className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {award.issuer ?? award.org}
          </p>
          <h3 className="mt-2 text-base font-medium leading-snug text-foreground sm:text-lg">
            {award.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{award.org}</p>
        </div>
        {award.scope === "team" ? (
          <span className="shrink-0 rounded-full border border-border/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Team
          </span>
        ) : null}
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
    </SpotlightCard>
  );
}

export function AchievementsGrid({ awards }: { awards: readonly Award[] }) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && reduceMotion === true;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {awards.map((award) => (
        <AchievementCard key={`${award.title}-${award.org}`} award={award} reduced={reduced} />
      ))}
    </div>
  );
}
