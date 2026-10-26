"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useCallback, useRef } from "react";

import { BulletList } from "@/components/ui/bullet-list";
import { TagList } from "@/components/ui/tag-list";
import { useHydrated } from "@/hooks/use-hydrated";
import type { ExperienceItem, MonthKey } from "@/content/types";

/**
 * Experience as a scroll-beam timeline, with a Bencho edge light on each card.
 *
 * ── WHY A TIMELINE HERE, AND NOT IN ACHIEVEMENTS ────────────────────
 * These three roles are ordered by time and the order carries meaning: the
 * reader should be able to see the move from a training programme into applied
 * work. A vertical rail with a beam that fills as the reader scrolls is the
 * Aceternity timeline pattern, and it is the right shape for exactly that.
 *
 * Achievements are not a sequence, so they do not get this shape. They are
 * grouped by issuer in `achievements-bento.tsx`. Two sections that both answer
 * "what have you done" should not look like two copies of one chart.
 *
 * ── THE DATE IS THE ANCHOR, NOT A DECORATION ────────────────────────
 * On a wide screen the start month and year stick in a left column while the
 * role's card scrolls past it. That is the useful part of the pattern: the
 * reader can always see which point on the rail they are reading. The column is
 * `aria-hidden` because the card carries the full authored range, including
 * "Remote"; repeating it for a screen reader would read the date twice.
 *
 * ── BENCHO EDGE LIGHT ───────────────────────────────────────────────
 * The pointer writes `--edge-angle` on the card and the stylesheet paints a
 * short arc of light on the rim at that angle. It is colour-only: the card does
 * not tilt, lift or move, because this is a reading surface and a surface that
 * moves under the pointer is one the eye cannot rest on. The rect is measured
 * once on `pointerenter`, not on every move, so the gesture does not force a
 * layout per frame.
 *
 * ── NO HEIGHT MEASUREMENT ───────────────────────────────────────────
 * The usual version of this component measures the container and animates a
 * pixel height, which needs an effect, a resize listener and a state update.
 * This one puts a full-height fill on the rail and scales it with the scroll
 * progress, so the beam is one compositor-only `scaleY` and stays correct at
 * every viewport without JavaScript bookkeeping.
 *
 * Under reduced motion the beam is drawn full and the edge light is removed by
 * the stylesheet. Without JavaScript every role, date, bullet and chip is still
 * on screen: the entrance is a transform only and never an opacity.
 */

const ENTER_SPRING = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.7,
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function startOf(key: MonthKey) {
  const [year, month] = key.split("-").map(Number) as [number, number];
  return {
    year: String(year),
    month: MONTHS[(month - 1 + 12) % 12] ?? "",
  };
}

function Stop({
  item,
  index,
  reduced,
}: {
  item: ExperienceItem;
  index: number;
  reduced: boolean;
}) {
  const rect = useRef<DOMRect | null>(null);
  const start = startOf(item.start);

  const enter = useCallback((event: React.PointerEvent<HTMLElement>) => {
    rect.current = event.currentTarget.getBoundingClientRect();
  }, []);

  const move = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (reduced) return;
      const box = rect.current;
      if (!box) return;
      /* Angle from the card's centre, with 0deg at the top to match the
         conic gradient's origin. */
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      event.currentTarget.style.setProperty(
        "--edge-angle",
        `${angle.toFixed(1)}deg`,
      );
    },
    [reduced],
  );

  return (
    <li className="relative grid gap-y-4 pb-12 pl-8 last:pb-0 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-x-10 md:gap-y-0 md:pb-16 md:pl-0">
      {/* The marker sits on the rail. `ring-background` cuts the rail line behind
          it, so the dot reads as a stop rather than a knot. */}
      <span
        aria-hidden="true"
        className="absolute left-2 top-2 z-10 size-2 -translate-x-1/2 rounded-full bg-foreground ring-4 ring-background md:left-[9.25rem]"
      />

      {/* Start date, sticky on a wide screen. Hidden from assistive tech because
          the card below states the full range, including the location. */}
      <div
        aria-hidden="true"
        className="md:sticky md:top-24 md:self-start"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {start.month}
        </p>
        <p className="mt-1 text-3xl font-medium leading-none tracking-tight text-foreground tabular-nums sm:text-4xl">
          {start.year}
        </p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {item.end === null ? "Current" : "Completed"}
        </p>
      </div>

      <motion.article
        data-experience-stop={item.org}
        /* Transform-only entrance. See the file header. */
        initial={{ y: 12 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={
          reduced
            ? { duration: 0 }
            : { ...ENTER_SPRING, delay: Math.min(index, 5) * 0.06 }
        }
        onPointerEnter={enter}
        onPointerMove={move}
        className="edge-light group relative min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors duration-300 hover:border-foreground/20 hover:bg-card/60 sm:p-6"
      >
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <h3 className="text-lg font-medium leading-snug text-foreground sm:text-xl">
                {item.role}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.org}</p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-right">
              {item.meta}
            </p>
          </div>

          {/* The strongest fact in the role, before the evidence. */}
          <p className="mt-4 border-l-2 border-foreground/25 pl-3 text-sm leading-relaxed text-foreground">
            {item.outcome}
          </p>

          <BulletList
            items={item.bullets}
            className="mt-4 text-sm leading-relaxed"
          />
          <TagList
            items={item.stack}
            label={`${item.role} stack`}
            className="mt-5"
          />
        </div>
      </motion.article>
    </li>
  );
}

export type ExperienceTimelineBeamProps = {
  items: readonly ExperienceItem[];
  className?: string;
};

export function ExperienceTimelineBeam({
  items,
  className,
}: ExperienceTimelineBeamProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  /* The shared reduced-motion guard. `useReducedMotion()` is null on the server
     and the real value on the client's first render, so without `hydrated` the
     two sides would pick different trees and React would report a mismatch. */
  const reduced = hydrated && reduceMotion === true;

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.85", "end 0.55"],
  });

  return (
    <div className={className}>
      <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="text-foreground">
          {String(items.length).padStart(2, "0")}
        </span>{" "}
        roles, most recent first
      </p>

      <div className="relative">
        {/* The rail. One muted track and one foreground fill; the fill is the
            beam. `left-[9.25rem]` is the centre of the 2.5rem gap between the
            8rem date column and the card column. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-2 left-2 w-px bg-border md:left-[9.25rem]"
        >
          {reduced ? (
            <div className="h-full w-px bg-foreground" />
          ) : (
            <motion.div
              style={{ scaleY: scrollYProgress }}
              className="h-full w-px origin-top bg-foreground"
            />
          )}
        </div>

        <ol ref={listRef} className="flex flex-col">
          {items.map((item, index) => (
            <Stop
              key={`${item.role}-${item.org}`}
              item={item}
              index={index}
              reduced={reduced}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}
