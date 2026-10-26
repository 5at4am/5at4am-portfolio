"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { TechIcon } from "@/components/ui/tech-icons";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { TechGroup } from "@/content/tech-stack";

const TAP_SPRING = { type: "spring" as const, stiffness: 520, damping: 24, mass: 0.6 };

const PRIMARY_GROUP_ID = "ai-ml";

const AT_REST = "text-muted-foreground";
const EMPHASISED = "text-foreground";

export type SkillsBentoProps = {
  groups: readonly TechGroup[];
  highlightedIds?: ReadonlySet<string>;
  className?: string;
};

function HoverEffectCard({
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
    <div
      onMouseMove={handleMouseMove}
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
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(255, 255, 255, 0.06),
                transparent 80%
              )
            `,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function TechItem({
  tech,
  highlighted,
  reduced,
}: {
  tech: TechGroup["items"][number];
  highlighted: boolean;
  reduced: boolean;
}) {
  return (
    <motion.li
      className="group/item flex items-center gap-2 py-0.5"
      whileHover={reduced ? undefined : { x: 2 }}
      transition={reduced ? { duration: 0 } : TAP_SPRING}
    >
      <TechIcon
        name={tech.icon}
        className={cn(
          "size-4 shrink-0 transition-transform duration-150 ease-out group-hover/item:-translate-y-px",
          highlighted ? "text-foreground/80 group-hover/item:text-foreground" : AT_REST,
          "group-hover/item:text-foreground"
        )}
      />
      <span
        className={cn(
          "text-sm leading-tight transition-colors duration-150 ease-out group-hover/item:text-foreground",
          highlighted ? "font-medium text-foreground" : AT_REST
        )}
      >
        {tech.name}
      </span>
    </motion.li>
  );
}

function BentoCard({
  group,
  highlightedIds,
  reduced,
  active,
  onPreview,
}: {
  group: TechGroup;
  highlightedIds: ReadonlySet<string>;
  reduced: boolean;
  active: boolean;
  onPreview: (id: string | null) => void;
}) {
  const isPrimary = group.id === PRIMARY_GROUP_ID;
  const ruleActive = active || isPrimary;

  return (
    <HoverEffectCard
      reduced={reduced}
      className={cn(
        isPrimary && "md:col-span-2 lg:col-span-2",
        "flex flex-col"
      )}
    >
      <div
        onMouseEnter={() => onPreview(group.id)}
        onMouseLeave={() => onPreview(null)}
        className="flex flex-col"
      >
        <h3
          className={cn(
            "flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300",
            isPrimary || active ? EMPHASISED : AT_REST
          )}
        >
          <span className="min-w-0 truncate">{group.label}</span>
          <span aria-hidden="true" className="shrink-0 tabular-nums text-muted-foreground">
            {group.items.length}
          </span>
        </h3>
        <div
          aria-hidden="true"
          className={cn(
            "mt-3 h-px transition-colors duration-300",
            isPrimary ? "skills-sheen" : ruleActive ? "bg-foreground" : "bg-border"
          )}
        />
        <ul className={cn("mt-4 grid gap-x-4 gap-y-1", isPrimary ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {group.items.map((tech) => (
            <TechItem
              key={tech.id}
              tech={tech}
              highlighted={highlightedIds.has(tech.id)}
              reduced={reduced}
            />
          ))}
        </ul>
      </div>
    </HoverEffectCard>
  );
}

const EMPTY = new Set<string>();

export function SkillsBento({ groups, highlightedIds, className }: SkillsBentoProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && reduceMotion === true;

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const activeId = pinnedId ?? previewId;

  const clearPin = useCallback(() => setPinnedId(null), []);
  useEscapeKey(pinnedId !== null, clearPin);

  const handlePin = useCallback((id: string) => {
    setPinnedId((current) => (current === id ? null : id));
  }, []);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const activeGroup = activeId ? groups.find((group) => group.id === activeId) : undefined;
  const activePercent = activeGroup && total > 0 ? Math.round((activeGroup.items.length / total) * 100) : null;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          data-skills-readout=""
          className="min-h-[1.5rem] font-mono text-xs text-muted-foreground"
        >
          {activeGroup && activePercent !== null ? (
            <>
              <span className="text-foreground">{activeGroup.label}</span>
              {` — ${activeGroup.items.length} of ${total} tools, ${activePercent}% of the stack`}
              {pinnedId === activeGroup.id ? " · pinned, Escape to clear" : null}
            </>
          ) : (
            `${total} tools across ${groups.length} categories`
          )}
        </p>
        <p className="text-xs text-muted-foreground">Hover to focus • Click to pin</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <BentoCard
            key={group.id}
            group={group}
            highlightedIds={highlightedIds ?? EMPTY}
            reduced={reduced}
            active={activeId === group.id}
            onPreview={setPreviewId}
          />
        ))}
      </div>
    </div>
  );
}
