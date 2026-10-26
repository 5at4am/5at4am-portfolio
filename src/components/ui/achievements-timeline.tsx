"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { Award, BadgeCheck, Trophy } from "lucide-react";
import { useCallback } from "react";

import { ExternalLink } from "@/components/ui/external-link";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { Award as AwardType } from "@/content/types";

const ENTER_SPRING = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.7 };

function GlowCard({
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
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 sm:p-6",
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
    </motion.article>
  );
}

function getIcon(scope?: string) {
  if (scope === "team") return Trophy;
  return BadgeCheck;
}

export function AchievementsTimeline({ awards }: { awards: readonly AwardType[] }) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && reduceMotion === true;

  return (
    <div className="relative">
      <div className="absolute left-[1.125rem] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-foreground/20 via-border to-transparent sm:block" />
      <div className="flex flex-col gap-8">
        {awards.map((award, index) => {
          const Icon = getIcon(award.scope);
          return (
            <div key={`${award.title}-${index}`} className="relative grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6">
              <div className="relative hidden sm:flex sm:flex-col sm:items-center">
                <motion.div
                  initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                  whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={reduced ? { duration: 0 } : { ...ENTER_SPRING, delay: index * 0.03 }}
                  className="relative z-10 mt-6 flex size-9 items-center justify-center rounded-full border border-border/70 bg-card/60"
                >
                  <Icon className="size-4 text-foreground/80" />
                </motion.div>
              </div>
              <GlowCard reduced={reduced}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="size-3.5 text-foreground/70 sm:hidden" />
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
              </GlowCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
