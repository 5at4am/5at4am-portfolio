"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";

import { BulletList } from "@/components/ui/bullet-list";
import { TagList } from "@/components/ui/tag-list";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { ExperienceItem, MonthKey } from "@/content/types";

/**
 * Internship history as a two-axis time encoding.
 *
 * ── THE IDEA ─────────────────────────────────────────────────────
 * A vertical timeline already spends one axis on time: the gap between two
 * roles is the space between them. That leaves a second axis unused, and this
 * section spends it on the one number the reader cannot otherwise compare at a
 * glance — **how long each role lasted**.
 *
 * Each stop carries a horizontal duration bar, scaled against the longest role
 * in the list. Two bars side by side answer "was this a two-month sprint or a
 * year?" without reading either date range. The vertical axis keeps answering
 * "how long was the break?", so the two axes say genuinely different things and
 * neither is decoration:
 *
 * | axis | encodes | example here |
 * |---|---|---|
 * | vertical space, between stops | the gap | 8 months between roles |
 * | horizontal bar width, within a stop | the role's own length | 4-month bar next to a 12-month bar |
 *
 * The bars are segmented by `stack.length`, so the single most-repeated theme in
 * this career — applied AI, every role — is visible as a family resemblance
 * between the bars without anyone having to read a bullet.
 *
 * ── WHY NOT THE OBVIOUS ALTERNATIVES ─────────────────────────────
 * - **Pinned scroll-driven storytelling.** Already rejected for `ProjectsSection`
 *   for the same reasons: it spends an enormous amount of scroll distance per
 *   item, blurs the thing you are trying to read, and scroll-jacking is a
 *   High-severity motion-sickness risk. This section is scroll-*driven*, never
 *   scroll-*consuming*: the rail answers the reader's own scroll position and
 *   costs no extra travel.
 * - **A card grid or bento.** `SkillsIndex` already owns that shape on this page,
 *   and two adjacent grid sections read as one undifferentiated wall.
 * - **An accordion.** `ProjectAccordion` already owns that gesture. Repeating it
 *   here would make the second one ordinary, so the disclosure here is scoped to
 *   the per-role evidence — the bullets and the stack — while role, org, dates
 *   and outcome stay permanently visible.
 * - **A constellation / force graph.** Genuinely more novel, and rejected on the
 *   grounds that this section's job is resume legibility. A graph makes "which
 *   role, which dates, which result" the hardest thing on the page to answer,
 *   which inverts the section's purpose.
 *
 * ── THE OUTCOME IS THE HEADLINE, NOT THE BULLETS ─────────────────
 * `item.outcome` gets the largest type in the stop and sits directly under the
 * role. The bullets are the evidence and stay collapsed behind a real disclosure.
 * This is the reverse of the usual resume block, where the bullets are the wall
 * of text and the headline is a footnote, and it is the main reason this section
 * is readable at a glance: the strongest fact in each role is on screen before
 * any interaction.
 *
 * ── MOTION ───────────────────────────────────────────────────────
 * One thing moves on its own: the rail's fill, scrubbed to the reader's scroll
 * position, so motion always answers an action instead of running on a timer.
 * Everything else is a 200-320ms transition triggered by hover, focus, or a tap.
 * Per the "excessive motion" guidance, at most the rail and the active bar's
 * segments move at once.
 *
 * Only `opacity` and `transform` are animated. `height` and `top` never are,
 * because those force layout on every frame and are the usual reason a scroll
 * section feels sticky. The rail fill is a single `scaleY`, so it stays on the
 * compositor.
 *
 * ── THE EVIDENCE IS A NATIVE `<details>`, NOT A HEIGHT ANIMATION ──
 * Each role's bullets and stack sit behind a `<details>`, so the platform owns
 * the disclosure: Enter, Space and tap all work, and — the reason this is not a
 * `motion.div` behind a `<button>` — a closed panel is genuinely not rendered,
 * rather than being laid out at `height:0;opacity:0` with `inert` on top. The
 * earlier version of this file shipped exactly that, and it meant that with
 * scripting off every accomplishment statement in the section was present in the
 * DOM but permanently unreachable.
 *
 * The cost is that the panel does not animate open; the open state is signalled
 * by the chevron rotating and the `Show`/`Hide` label, both pure CSS on
 * `details[open]`, so the label is still correct with scripting off. Given the
 * section's job is being readable, that is the right way round.
 *
 * ── NOTHING IS HIDDEN, AND NOTHING IS DIMMED ─────────────────────
 * Every stop's role, org, dates and outcome are in the DOM at full contrast
 * before any interaction. The bars are decorative *geometry*, so they may recede;
 * text may not. Emphasising one stop never means un-reading another: an earlier
 * version dropped the inactive stops to `opacity-55` and measured 3.01:1 dark /
 * 2.12:1 light against their own background — a straight WCAG AA failure, made
 * worse by focus triggering the same state as hover, so tabbing broke it.
 *
 * Under `prefers-reduced-motion` the rail draws full, the bars are static, and
 * the disclosure needs no special handling because it never animated. The section
 * becomes a plain, fully legible list of roles with a duration bar beside each.
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
 * How long a role ran, in months, inclusive of both endpoints.
 *
 * Inclusive because "Dec 2025 to Jan 2026" is two months of calendar, not one —
 * and a two-month capstone shown as a bar one unit wide against a five-month
 * role would understate it.
 *
 * The live span is measured against a *frozen* "present" captured once per render
 * pass rather than per item, so every bar in the section shares one denominator.
 */
function durationMonths(
  item: ExperienceItem,
  present: number,
): number {
  const end = item.end === null ? present : monthIndex(item.end);
  return Math.max(1, end - monthIndex(item.start) + 1);
}

type Gap = { px: number; months: number };

/**
 * Gap before each stop, in chronological order. The first is `null` because it
 * opens the rail rather than following anything.
 *
 * Pixels per month is deliberately small. The gaps are the point, but a literal
 * scale would make an eight-month gap 400px of empty rail in a section whose
 * content is only three entries long.
 */
const PX_PER_MONTH = 9;

/** Never collapse a gap entirely, and never let one dominate the section. */
const MIN_GAP_PX = 28;
const MAX_GAP_PX = 96;

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
      px: Math.min(MAX_GAP_PX, Math.max(MIN_GAP_PX, months * PX_PER_MONTH)),
    });
  }
  return out;
}

/**
 * The two text weights a stop can take.
 *
 * `RESTING` holds each line at its own token contrast. `FOCUSED` is the same
 * tokens with nothing changed except which lines carry the emphasis. There is
 * deliberately no third, dimmed state — see the note in the file header for the
 * measurements that killed it.
 */
const RESTING =
  "relative pl-10 transition-colors duration-200 ease-out";
const FOCUSED = cn(RESTING, "text-foreground");

/**
 * The hover and press spring, borrowed from `dragging-ball.tsx`: the same
 * `{ stiffness: 520, damping: 24, mass: 0.6 }` that section uses for its hover
 * and press. A squeeze that arrives on a curve is a shape being animated; one
 * that arrives with a little overshoot is a soft thing giving.
 */
const TAP_SPRING = { type: "spring", stiffness: 520, damping: 24, mass: 0.6 } as const;

/** Looser than a press, because an entrance travels further than a squeeze. */
const ENTER_SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.7 } as const;

/**
 * The duration bar: one segment per stack entry, filled to the role's share of
 * the longest role on the page.
 *
 * `aria-hidden`. The bar restates what the surrounding text already says in
 * words — the role's dates are on the stop, its stack is in the disclosure — so
 * exposing it would make a screen reader announce the same content twice, in a
 * worse form.
 *
 * The bars are decorative *geometry*, which is why they are allowed to recede on
 * an inactive stop while the text beside them does not.
 *
 * ── HOW THE LENGTH IS ENCODED, AND A BUG THAT BROKE IT ────────────
 * The bar is a flex row of two children: a group holding the segments, and a
 * trough holding the remainder. The group's `flexGrow` is the ratio and the
 * trough's is `1 - ratio`, both on `flexBasis: 0`, so the group takes exactly
 * `ratio` of the row.
 *
 * The first version put `flexGrow: 1` on each segment directly and
 * `flexGrow: 1 - ratio` on the trough. That is wrong, because the segments then
 * split `1` *among themselves* and the trough's share competes with the sum of
 * all of them: three bars measured 0.83 / 0.845 / 0.81 for roles of 3, 2 and 6
 * months, i.e. a two-month capstone and a six-month job drew the same width.
 * The ratio has to be applied to the GROUP, not to the segments inside it.
 *
 * `Math.max(0.001, 1 - ratio)` rather than `1 - ratio` so the longest role gets a
 * trough element that is present but zero-width, instead of a `flex-grow: 0`
 * element that collapses to `min-content` and can round to a visible sliver.
 */
function DurationBar({
  segments,
  ratio,
  active,
  reduced,
}: {
  segments: number;
  ratio: number;
  active: boolean;
  reduced: boolean;
}) {
  return (
    <div aria-hidden="true" className="mt-3 flex h-1.5 w-full items-stretch">
      {/* The filled part. `pr-0.5` keeps the segment gaps inside the group, so the
          gap does not eat into the ratio.

          `scaleY` rather than `scaleX`, so the bar grows thicker when active
          without its width moving by a pixel — the width is data, and the
          thickness is decoration. Scaling X would have shifted the encoded
          proportion. */}
      <motion.span
        className="flex items-stretch gap-0.5 overflow-hidden pr-0.5"
        initial={false}
        animate={{ scaleY: reduced ? 1 : active ? 1.6 : 1 }}
        whileHover={reduced ? undefined : { scaleY: 1.35 }}
        transition={reduced ? { duration: 0 } : TAP_SPRING}
        style={{
          flexGrow: Math.max(0.001, ratio),
          flexBasis: 0,
          transformOrigin: "center",
        }}
      >
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-full flex-1 rounded-full transition-colors duration-300 ease-out",
              active ? "bg-foreground" : "bg-muted-foreground/45",
            )}
          />
        ))}
      </motion.span>

      {/* The remainder, so a short role reads as "this much of the way" rather
          than "this is all of it". */}
      <span
        className="h-full rounded-full bg-border"
        style={{ flexGrow: Math.max(0.001, 1 - ratio), flexBasis: 0 }}
      />
    </div>
  );
}

function Stop({
  item,
  index,
  active,
  reduced,
  ratio,
  onActivate,
  onRelease,
}: {
  item: ExperienceItem;
  /** Position on the rail, for the entrance stagger only. */
  index: number;
  active: boolean;
  reduced: boolean;
  ratio: number;
  onActivate: () => void;
  onRelease: () => void;
}) {
  return (
    <motion.div
      /*
        `tabIndex={0}` on the wrapper is what makes the hover treatment reachable
        by keyboard — without it, `tab` skips this section entirely and the
        emphasis a mouse user gets is mouse-only. No ARIA role: this is still a
        list item being read, not a control being operated. The disclosure below
        is a native `<details>`, which brings its own keyboard and touch
        behaviour and does not need a tab stop of its own.
      */
      tabIndex={0}
      onMouseEnter={onActivate}
      onMouseLeave={onRelease}
      onFocus={onActivate}
      onBlur={onRelease}
      className={active ? FOCUSED : RESTING}
      data-experience-stop={item.org}
      data-active={active ? "true" : "false"}
      /* `initial={{ y: 12 }}`, NOT `initial={{ opacity: 0, y: 12 }}`.

         The server renders this branch — `useReducedMotion()` is `null` there
         and `false` in the browser — so the HTML ships these initial values. An
         `opacity: 0` among them would put every role, date and outcome into the
         static HTML painted at zero, and the `whileInView` that was meant to
         reveal them needs an `IntersectionObserver` that never arrives without
         scripting.

         `y: 12` alone is fully readable in the static HTML — twelve pixels low,
         not invisible — and springs to rest once JS runs. Same trade as
         `skills-index.tsx` and `about-section.tsx`: transform-only initials buy
         an entrance without giving up the no-JS guarantee. */
      initial={{ y: 12 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ ...ENTER_SPRING, delay: index * 0.06 }}
    >
      {/* The marker. `size-4` at `left-0` puts its centre on x=8, where the rail
          runs, and `top-1.5` puts it on the first line's centre. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1.5 size-4 rounded-full border-2 bg-background transition-colors duration-200 ease-out",
          active || reduced ? "border-foreground" : "border-border",
        )}
      />

      {/* Role and dates share a baseline row, wrapping rather than truncating: a
          clipped role name is worse than a two-line header. The name keeps
          `text-foreground` in both states, because that is what stops three
          jobs reading as three undifferentiated blocks. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-medium text-foreground">{item.role}</h3>
        <p className="font-mono text-xs text-muted-foreground">{item.meta}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{item.org}</p>

      {/* The second axis. Sits directly under the identity block so the reader
          meets "who, where, when" and "how long" as one unit before any prose. */}
      <DurationBar
        segments={Math.max(1, item.stack.length)}
        ratio={ratio}
        active={active}
        reduced={reduced}
      />

      {/* The outcome. The largest type in the stop, and the reason the stop is
          on the rail at all — this is a colour change only, with no opacity
          anywhere near the text. */}
      <p
        className={cn(
          "mt-4 text-lg font-medium transition-colors duration-200 ease-out",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {item.outcome}
      </p>

      {/*
        A native `<details>`, which is the whole reason the evidence is reachable
        at all.

        This was a `motion.div` height animation behind a `<button>` with
        `aria-expanded`, and the built HTML shipped `height:0px;opacity:0` plus
        `inert` on all three panels. That is fine with scripting on and
        useless without it: the bullets are in the DOM but nothing can ever
        reveal them, so a reader with JS disabled loses every accomplishment
        statement in the section while the page still looks complete. Measured in
        the built `out/index.html`, three `opacity:0` occurrences and no way to
        clear them.

        `<details>` inverts that. The closed state is enforced by the platform
        rather than by inline styles, so the content is not merely transparent —
        it is genuinely not rendered, and it is not focusable, which removes the
        need for the `inert` bookkeeping entirely. Enter, Space, and a tap all
        work because the browser implements them.

        The cost is the height animation, which needs JS to measure. The open
        state is signalled by the chevron rotating and the summary's own
        `details[open]` styling, both pure CSS. `Show`/`Hide` are two spans
        toggled by that same selector rather than by React state, so the label is
        also correct with scripting off.
      */}
      <details className="group mt-4">
        <summary
          className={cn(
            "inline-flex min-h-[36px] cursor-pointer list-none items-center gap-2 rounded-sm",
            "text-sm text-muted-foreground transition-colors duration-200 ease-out",
            "hover:text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
            /* The marker is the one thing <details> adds for free that a custom
               control has to rebuild. */
            "[&::-webkit-details-marker]:hidden",
          )}
        >
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
          <span>what I built</span>
          <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">
            {item.bullets.length + item.stack.length}
          </span>
          <span
            aria-hidden="true"
            /* `--ease-spring` rather than `ease-out`. This chevron turns because
               `details[open]` changed, and that state lives in the platform — there
               is no React state to hand a framer spring. A CSS transition is the
               only option, so the spring has to be expressed as a curve. The
               token overshoots slightly before settling, which is what makes it
               read as a detent being thrown rather than as a value being tweened.
               `reduced` does not reach here, which is deliberate: this is a 90°
               rotation on a 10px glyph with no travel, and cancelling it would
               leave the indicator unable to point anywhere. */
            className="transition-transform duration-500 [transition-timing-function:var(--ease-spring)] group-open:rotate-90"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M3.5 1.5 7 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </summary>

        <BulletList items={item.bullets} />
        <TagList items={item.stack} label={`${item.role} stack`} />
      </details>
    </motion.div>
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
  const hydrated = useHydrated();

  /* See `reduced` in `SkillsIndex`: `useReducedMotion()` is `null` on the server
     and `false` in the browser, so `reduceMotion !== false` rendered the plain
     rail server-side and the animated one on the client — two trees, and a
     hydration mismatch on every load. `hydrated` is false for the server and the
     hydration render alike, so both pick the same branch. */
  const reduced = hydrated && reduceMotion === true;

  /* Content is chronological oldest-first on the rail, the direction a timeline
     reads, and the reverse of the resume's most-recent-first list order. Copied
     rather than sorted in place: `EXPERIENCE` is a frozen content array and must
     not be reordered by a component. */
  const present = presentIndex();
  const ordered = [...items].sort(
    (a, b) => monthIndex(a.start) - monthIndex(b.start),
  );
  const gaps = computeGaps(ordered, present);

  /* The shared denominator for every duration bar. One pass over the list, so the
     bars are comparable with each other by construction rather than by each being
     scaled to itself. */
  const longest = ordered.reduce(
    (max, item) => Math.max(max, durationMonths(item, present)),
    1,
  );

  /*
    `offset` in viewport units: the fill completes as the last stop's marker
    reaches the middle of the screen, so the rail is never complete while a stop
    is still below the fold, and never stuck empty above one already read.
  */
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.85", "end 0.4"],
  });

  const release = useCallback(() => setActive(null), []);

  /* Escape drops the emphasis. Not strictly required — the state clears on
     `mouseleave`/`blur` anyway — but a keyboard reader tabbing past the section
     should not leave a stop lit, and `useEscapeKey` is already the site's
     convention for that. */
  useEscapeKey(active !== null, release);

  return (
    <div
      ref={railRef}
      className={cn("relative", className)}
      onMouseLeave={release}
    >
      {/* The rail: an unlit track and, over it, the scrubbed fill. Both are `w-px`
          at `left-2`, the x the markers' centres sit on. */}
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
            /* One `li` per role. The gap spacer lives *inside* it and the stop is
               a plain `div` inside that, so the list is flat and valid — an
               `<li>` may contain flow content, but not another `<li>`.

               The spacer is NOT `aria-hidden`. An earlier version claimed it was
               safe because "the months are announced on the role itself"; they
               are not, `item.meta` is a date range and never states the gap
               length, so hiding it made the one piece of information this
               section exists to show unavailable to assistive tech. */
            <li key={item.role}>
              {gap ? (
                <div
                  role="presentation"
                  className="flex items-center"
                  style={{ height: gap.px }}
                >
                  <p className="pl-10 font-mono text-xs text-muted-foreground">
                    {gap.months > 0
                      ? `${gap.months} ${gap.months === 1 ? "month" : "months"} between roles`
                      : null}
                  </p>
                </div>
              ) : null}
              <Stop
                item={item}
                index={i}
                active={active === i}
                reduced={reduced}
                ratio={durationMonths(item, present) / longest}
                onActivate={() => setActive(i)}
                onRelease={release}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}