"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ExternalLink } from "@/components/ui/external-link";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { Award } from "@/content/types";

/**
 * Achievements as a ledger grouped by ISSUER.
 *
 * ── WHY THIS IS NOT A GRID OF CARDS ─────────────────────────────────
 * The obvious layout for eight achievements is eight tiles. This repo rejected
 * that once already — `skills-index.tsx` replaced a tile grid because "thirty-
 * eight bordered tiles spent a lot of visual weight on conveying a list" — and a
 * first pass at this section then reintroduced it as eight liquid-glass panes.
 * Same defect: eight near-identical surfaces say "here are eight things" and
 * nothing else. It also flattened a distinction the data actually contains.
 *
 * ── WHAT GROUPING BY ISSUER REVEALS ─────────────────────────────────
 * The eight credentials come from **six issuers**, and two of them cluster:
 *
 *   WiiZ x ESTREL.AI  2 credentials from ONE programme
 *   Samatrix          2 courses, eight months apart
 *
 * So the honest question this section answers is not "how many badges?" but
 * "how many programmes, and what did each one yield?" — and that is only visible
 * once the items sit under their issuer. A grid of eight tiles cannot show it,
 * because nothing in a tile says it was earned alongside another one.
 *
 * A second thing falls out of the grouping for free: **the two team-result
 * issuers are the top two by rank.** `AWARDS` is ordered by selectivity, and both
 * competitive results happen to come from programmes that also produced a second
 * credential. So team and personal separate organically, without the artificial
 * two-block split an earlier version imposed.
 *
 * ── WHY THE HIERARCHY IS CARRIED BY TYPE, NOT COLOUR ───────────────
 * A team's competitive win and a personal certificate are different kinds of
 * claim, and the page should not dress one up as the other. But the distinction is
 * made with the word "Team result" and with position, never with a tint: colour
 * alone is not an accessible indicator, and a colour that means "this is a real
 * achievement" is an evaluative claim the page has no business making visually.
 *
 * The issuer label is the thing that responds to the pointer — hovering a
 * credential brings its issuer to full ink. Full contrast, never opacity, for the
 * reason `AT_REST` in `skills-index.tsx` records: element opacity composites
 * against the page background before contrast is evaluated, and dimming this
 * section's text was measured at 3.01:1 dark and 2.12:1 light.
 *
 * ── MOTION ──────────────────────────────────────────────────────────
 * Transform-only staggered entrance, and one interaction: hovering or focusing a
 * credential lights its issuer. Nothing loops, nothing pins, nothing scroll-
 * hijacks. The previous version had a pointer tilt on every pane; a ledger is a
 * reading surface, and a reading surface that tilts when you move the mouse
 * across it is a reading surface you cannot rest your eyes on.
 */

const ENTER_SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.7 } as const;

type IssuerGroup = {
  /** The heading. `issuer` when set, otherwise `org`. */
  key: string;
  /** The issuer as written on the credential, for the row's own line. */
  awards: readonly Award[];
  /** True when every credential under this issuer is a team result. */
  allTeam: boolean;
};

/**
 * Group by issuer, preserving the rank order of `AWARDS`.
 *
 * The order of the groups is the position of each issuer's FIRST appearance, and
 * `AWARDS` is already ranked by selectivity — so the strongest result leads
 * without this function sorting anything by its own opinion. Within a group the
 * original order is kept for the same reason.
 */
function groupByIssuer(awards: readonly Award[]): IssuerGroup[] {
  const byKey = new Map<string, IssuerGroup>();

  for (const award of awards) {
    const key = award.issuer ?? award.org;
    const existing = byKey.get(key);
    if (existing) {
      existing.awards = [...existing.awards, award];
      existing.allTeam = existing.allTeam && award.scope === "team";
    } else {
      byKey.set(key, {
        key,
        awards: [award],
        allTeam: award.scope === "team",
      });
    }
  }

  return [...byKey.values()];
}

/** One credential. `lit` is set when this row is hovered or focused. */
function LedgerRow({
  award,
  index,
  lit,
  reduced,
  onHover,
}: {
  award: Award;
  index: number;
  lit: boolean;
  reduced: boolean;
  onHover: (on: boolean) => void;
}) {
  return (
    <motion.li
      /* Transform-only. An `opacity: 0` initial ships into the static HTML and a
         `whileInView` reveal needs an `IntersectionObserver` that never arrives
         without scripting, which would leave the whole section invisible. `y` is
         fully readable with JS off — a few pixels low, not gone. */
      initial={reduced ? false : { y: 8 }}
      whileInView={reduced ? undefined : { y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ ...ENTER_SPRING, delay: Math.min(index, 8) * 0.035 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      /* `tabIndex` is not needed for reading, but it is what makes the
         hover-to-light-issuer behaviour reachable by keyboard. Without it the
         ledger would be mouse-only decoration. No role: this is still a list item
         being read, not a control being operated. */
      tabIndex={0}
      data-lit={lit ? "true" : undefined}
      className={cn(
        "group/row grid grid-cols-1 gap-x-6 gap-y-1 border-t border-border py-4",
        "transition-colors duration-200 ease-out sm:grid-cols-[minmax(0,1fr)_auto]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        lit && "bg-muted/40",
      )}
    >
      <div className="min-w-0">
        <h4
          className={cn(
            "text-sm leading-snug transition-colors duration-200 ease-out",
            award.scope === "team"
              ? "font-medium text-foreground"
              : "font-normal text-foreground",
          )}
        >
          {award.title}
        </h4>

        <p className="mt-1 text-xs text-muted-foreground">{award.org}</p>
      </div>

      {/* The right-hand column: the scope word where it applies, then the date.
          `tabular-nums` so a column of dates lines up on the decimal rather than
          jittering as the glyphs change. */}
      <div className="flex items-baseline gap-x-4 sm:justify-end">
        {award.scope === "team" ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Team result
          </span>
        ) : null}
        {award.date ? (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {award.date}
          </span>
        ) : null}
        {award.credentialId ? (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {`ID ${award.credentialId}`}
          </span>
        ) : null}
        {award.href ? (
          <ExternalLink href={award.href} className="font-mono text-xs">
            Verify
          </ExternalLink>
        ) : null}
      </div>
    </motion.li>
  );
}

export type AchievementsLedgerProps = {
  awards: readonly Award[];
  className?: string;
};

export function AchievementsLedger({
  awards,
  className,
}: AchievementsLedgerProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const reduced = hydrated && reduceMotion === true;

  const [litKey, setLitKey] = useState<string | null>(null);

  /* A running index across all groups, so the entrance stagger continues down the
     ledger instead of restarting at each issuer.

     Computed as cumulative offsets in a `reduce` rather than by incrementing a
     variable inside the `.map` callback: `react-hooks/immutability` rejects
     reassigning a binding during render, and it is right to — a render that
     mutates anything it reads can produce a different result on the next pass. */
  const groups = groupByIssuer(awards);
  const starts = groups.reduce<number[]>(
    (acc, group, i) => [...acc, (acc[i - 1] ?? 0) + (i === 0 ? 0 : groups[i - 1].awards.length)],
    [],
  );

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      {groups.map((group, groupIndex) => {
        const lit = litKey === group.key;
        const first = starts[groupIndex] ?? 0;

        return (
          <section key={group.key} aria-labelledby={`issuer-${groupIndex}`}>
            {/* The issuer heading. It is the thing that responds to the pointer,
                and it is the only element whose emphasis changes — so at most one
                line on the page is ever in the active state. */}
            <h3
              id={`issuer-${groupIndex}`}
              className={cn(
                "flex flex-wrap items-baseline gap-x-3 gap-y-1 transition-colors duration-300 ease-out",
                "font-mono text-xs uppercase tracking-[0.16em]",
                lit ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="min-w-0">{group.key}</span>
              {/* How many credentials this issuer produced. The number is the
                  point of the grouping: "2" under WiiZ is the fact the grid of
                  eight tiles could not show.

                  `text-foreground`, NOT `opacity-70`. The count starts life as
                  `text-muted-foreground` like every other line and moves toward
                  the ink when its rows are hovered, which is emphasis by colour
                  rather than by transparency. `opacity-70` was tried first and is
                  the exact defect `AT_REST` in `skills-index.tsx` documents:
                  element opacity composites against the page background before
                  contrast is evaluated, and dimming this section's text measured
                  3.01:1 dark and 2.12:1 light. */}
              <span
                aria-hidden="true"
                className={cn(
                  "tabular-nums transition-colors duration-300 ease-out",
                  lit ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {String(group.awards.length).padStart(2, "0")}
              </span>
              <span className="sr-only">
                {group.awards.length === 1
                  ? "issued one credential"
                  : `issued ${group.awards.length} credentials`}
              </span>
            </h3>

            <ul className="mt-1">
              {group.awards.map((award, i) => (
                <LedgerRow
                  key={`${award.title}-${i}`}
                  award={award}
                  index={first + i}
                  lit={lit}
                  reduced={reduced}
                  onHover={(on) => setLitKey(on ? group.key : null)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}