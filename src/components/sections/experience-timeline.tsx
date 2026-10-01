"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";

import { BulletList } from "@/components/ui/bullet-list";
import type { ExperienceItem, MonthKey } from "@/content/types";

/**
 * Internship history as a scaled timeline.
 *
 * ── WHY THIS IS NOT A LIST ───────────────────────────────────────
 * `experience-section.tsx` was the only flat block on the page, sitting
 * between two sections that both ask for attention. The content decided the
 * shape: three short roles in a tight window, each producing something
 * concrete, and the spacing between them is real information. A list of three
 * equal blocks throws that away and renders three stints as three equal
 * stints.
 *
 * ── WHY NOT A SCROLL STACK ───────────────────────────────────────
 * `ProjectsSection` already owns the pin-and-blur mechanic, and three items
 * are not enough to deal out — six hundred pixels of scroll travelling three
 * cards reads thin, and putting the same gesture twice on one page makes the
 * second one ordinary. This section is scroll-*driven* rather than
 * scroll-*consuming*: it costs the reader no extra travel.
 *
 * ── THE RAIL IS SCALED, AND ONLY AT THE GAPS ─────────────────────
 * Stop positions are ordered by real date, and the space between two stops is
 * proportional to the months actually between them, so the reader can see an
 * eight-month gap and a three-month gap as different sizes. Within a stop the
 * height is content-driven, because a role's bullets have to be readable and a
 * 2-month role carries the same text as a 12-month one. Strict date-proportional
 * heights inside the stops would be prettier and less honest, because the text
 * would have to be truncated or shrunk to fit its own duration.
 *
 * An earlier pass also printed each role's OWN duration below its bullets. It
 * was cut, and the reason is worth keeping: the date range is already on the
 * stop in full ("Jan 2025 to Mar 2025"), so a bare "3 months" beneath it
 * restates what the reader has just read. Worse, it puts a number meaning
 * "how long this job" a few pixels from a number in the same mono weight
 * meaning "how long this gap", and those two are genuinely different
 * quantities. One number per gap, none per stop.
 *
 * ── MOTION ───────────────────────────────────────────────────────
 * One thing moves on its own: the rail's fill, scrubbed to scroll by the
 * reader's own position, so the motion always answers an action rather than
 * running on a timer. Per stop, only `opacity` and `transform` are animated;
 * `height` and `top` are never animated, because those force layout on every
 * frame and are the usual reason a scroll section feels sticky. The fill is a
 * single `scaleY`, so it stays on the compositor.
 *
 * ── NOTHING IS HIDDEN ────────────────────────────────────────────
 * Every bullet is in the DOM and readable at full contrast before any
 * interaction. Hover and focus only change emphasis: the active stop's marker
 * fills and its outcome reads at full contrast while the others recede. Under
 * `prefers-reduced-motion` the rail is drawn full and no dimming is applied,
 * so the section is a plain, fully legible timeline.
 */

/** Months, as an integer, so two `MonthKey`s are subtractable. */
function monthIndex(key: MonthKey): number {
  const [year, month] = key.split("-").map(Number) as [number, number];
  return year * 12 + (month - 1);
}

/**
 * The present month, for `end: null`. Read on the client so a role that ends
 * this month extends the rail without needing a rebuild or a stale constant.
 */
function presentIndex(): number {
  const now = new Date();
  return now.getFullYear() * 12 + now.getMonth();
}

/**
 * Pixels per month of real gap. Deliberately small: the gaps are the point,
 * but a literal scale would make a four-month gap 400px of empty rail in a
 * section whose content is only three entries long.
 */
const PX_PER_MONTH = 9;

/** Never collapse a gap entirely, and never let one dominate the section. */
const MIN_GAP_PX = 28;
const MAX_GAP_PX = 96;

type Gap = { px: number; months: number };

/**
 * Gap before each stop, in chronological order. The first is `null` because it
 * opens the rail rather than following anything.
 */
function computeGaps(
  ordered: readonly ExperienceItem[],
  present: number,
): readonly (Gap | null)[] {
  const out: (Gap | null)[] = [];
  for (let i = 0; i < ordered.length; i += 1) {
    if (i === 0) {
      out.push(null);
      continue;
    }
    const prev = ordered[i - 1];
    const prevEnd = prev.end === null ? present : monthIndex(prev.end);
    const months = Math.max(0, monthIndex(ordered[i].start) - prevEnd - 1);
    out.push({
      months,
      px: Math.min(
        MAX_GAP_PX,
        Math.max(MIN_GAP_PX, months * PX_PER_MONTH),
      ),
    });
  }
  return out;
}

function Stop({
  item,
  active,
  dimmed,
  reduced,
  onActivate,
  onRelease,
}: {
  item: ExperienceItem;
  active: boolean;
  dimmed: boolean;
  reduced: boolean;
  onActivate: () => void;
  onRelease: () => void;
}) {
  return (
    <li
      /* Focusable so the hover treatment is reachable by keyboard: without it,
         `tab` skips the section entirely and the emphasis a mouse user gets is
         mouse-only. No ARIA role — this is still a list item being read, not a
         control being operated. */
      tabIndex={0}
      onMouseEnter={onActivate}
      onMouseLeave={onRelease}
      onFocus={onActivate}
      onBlur={onRelease}
      className={
        dimmed
          ? "relative pl-10 opacity-55 transition-opacity duration-200 ease-out"
          : "relative pl-10 opacity-100 transition-opacity duration-200 ease-out"
      }
    >
      {/* The marker. `size-4` at `left-0` puts its centre on x=8, which is
          where the rail runs, and `top-1.5` puts its centre on the first line's
          centre. */}
      <span
        aria-hidden="true"
        className={
          active || reduced
            ? "absolute left-0 top-1.5 size-4 rounded-full border-2 border-foreground bg-background"
            : "absolute left-0 top-1.5 size-4 rounded-full border-2 border-border bg-background"
        }
      />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-medium text-foreground">{item.role}</h3>
        <p className="font-mono text-xs text-muted-foreground">{item.meta}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{item.org}</p>

      {/* The one line worth reading first, and the reason the stop is on the
          rail at all. Sits above the bullets because it is the outcome, and
          the bullets are the evidence. */}
      <p
        className={
          active
            ? "mt-4 text-base font-medium text-foreground transition-colors duration-200 ease-out"
            : "mt-4 text-base font-medium text-muted-foreground transition-colors duration-200 ease-out"
        }
      >
        {item.outcome}
      </p>

      <BulletList items={item.bullets} />
    </li>
  );
}

export type ExperienceTimelineProps = {
  items: readonly ExperienceItem[];
  className?: string;
};

export function ExperienceTimeline({
  items,
  className,
}: ExperienceTimelineProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  /* Null means the query has not resolved. Treated as reduced, so the first
     render is the visible static timeline rather than an empty rail waiting on
     a scrub that may never be allowed to run. */
  const reduced = reduceMotion !== false;

  /* Content is chronological oldest-first on the rail, which is the direction
     a timeline reads, and is the reverse of the resume's most-recent-first
     list order. Copied rather than sorted in place: `EXPERIENCE` is a frozen
     content array and must not be reordered by a component. */
  const present = presentIndex();
  const ordered = [...items].sort(
    (a, b) => monthIndex(a.start) - monthIndex(b.start),
  );
  const gaps = computeGaps(ordered, present);

  /* `offset` in viewport units: the fill completes as the last stop's marker
     reaches the middle of the screen, so the rail is never complete while a
     stop is still below the fold, and never stuck empty above one that is
     already read. */
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.85", "end 0.4"],
  });

  return (
    <div
      ref={railRef}
      className={className ?? "relative"}
      onMouseLeave={() => setActive(null)}
    >
      {/* The rail: an unlit track and, over it, the scrubbed fill. Both are
          `w-px` at `left-2`, the x the markers' centres sit on. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-2 w-px bg-border"
      />
      {!reduced ? (
        <motion.div
          aria-hidden="true"
          style={{ scaleY: scrollYProgress }}
          className="absolute inset-y-0 left-2 w-px origin-top bg-foreground"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-2 w-px bg-foreground"
        />
      )}

      <ol className="flex flex-col">
        {ordered.map((item, i) => {
          const gap = gaps[i];
          return (
            <li key={item.role} className="contents">
              {/* A gap is its own list item rather than a wrapper around the
                  stop, so the rail has one `li` per role and the spacer never
                  nests a list. `aria-hidden` because the spacing is the
                  finding; the months are announced on the role itself. */}
              {gap ? (
                <div
                  aria-hidden="true"
                  className="flex items-center"
                  style={{ height: gap.px }}
                >
                  <p className="pl-10 font-mono text-xs text-muted-foreground">
                    {gap.months > 0
                      ? `${gap.months} ${gap.months === 1 ? "month" : "months"}`
                      : null}
                  </p>
                </div>
              ) : null}
              <Stop
                item={item}
                active={active === i}
                dimmed={!reduced && active !== null && active !== i}
                reduced={reduced}
                onActivate={() => setActive(i)}
                onRelease={() => setActive(null)}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}