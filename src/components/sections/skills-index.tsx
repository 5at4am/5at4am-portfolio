"use client";

import { useCallback, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { TechIcon } from "@/components/ui/tech-icons";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { TechGroup } from "@/content/tech-stack";

/**
 * Forty technologies as a proportional composition bar and a typographic index.
 *
 * ── THE MOTION IS BORROWED FROM HERO AND CONTACT, NOT INVENTED ──
 * The first version of this section had `transition-colors duration-300` and
 * nothing else, and next to the hero and the contact ball it read as dead. So
 * the motion here uses the same four techniques those two sections already run,
 * rather than a lookalike of them:
 *
 * 1. **Springs, not eased curves.** `TAP_SPRING` is the exact
 *    `{ stiffness: 520, damping: 24, mass: 0.6 }` that `dragging-ball.tsx` uses
 *    for its hover and press. A squeeze that arrives on a curve is a shape being
 *    animated; one that arrives with a little overshoot is a soft thing giving.
 * 2. **Pointer-following through motion values, never React state.** Each segment
 *    tracks how far across itself the pointer is on a `useMotionValue` and
 *    derives a lean from it. Nothing re-renders per frame — which is the lesson
 *    `raj-ball.tsx` records when it gates its fan's re-aim to a 1.5° threshold.
 * 3. **A staggered fan-out.** `radial-menu.tsx` deals its options out with
 *    `transitionDelay: i * stagger`. Here the same idea runs down the item list:
 *    selecting a category springs its technologies up in sequence.
 * 4. **An ambient loop, but on something that is allowed to carry one.** `skills-sheen` sweeps the AI
 *    category's rule once every 7s, which is the section's only always-moving element. A matching sweep was
 *    tried across the composition bar and **removed**: the bar's fill has to clear 3:1 against the page, and
 *    in the light theme it sits at 3.54:1, so a `--background` highlight over it keeps that ratio only at an
 *    alpha of 7% or less — invisible. The effect was either imperceptible or a WCAG 1.4.11 failure, so the
 *    sheen stays on the hairline, which carries no data, and the bar's motion is the interactive kind instead.
 *
 * ── WHY THE BAR IS ALSO THE CONTROL ───────────────────────────────
 * One control that is also the overview, rather than a filter row above a
 * separate chart. Hovering or focusing a segment emphasises its column below, and
 * hovering a column lights its segment above: the relationship works in both
 * directions, which is what makes this read as a designed object rather than a
 * chart with a legend.
 *
 * **Nothing is ever hidden.** Emphasis is colour only, and never opacity, for the
 * contrast reason recorded on `AT_REST` below. A reader who never touches the bar
 * sees the identical list they saw before.
 *
 * ── EVERY INITIAL STATE IS A TRANSFORM, NEVER `opacity: 0` ───────
 * This is the rule that lets the section animate at all.
 *
 * `initial={{ opacity: 0 }}` ships into the static HTML, and a `whileInView`
 * reveal needs an `IntersectionObserver` to fire, so with scripting off the whole
 * section would sit painted at zero forever — 40 technologies, gone. That is why
 * `about-section.tsx`, `skills-index.tsx` and `experience-timeline.tsx` were all
 * moved to `initial={false}`, which is safe and which also means nothing moves on
 * entry at all.
 *
 * A transform-only initial resolves the two. `initial={{ y: 10 }}` leaves the
 * content fully painted and fully readable in the static HTML — ten pixels lower
 * than it settles — and springs to rest when JS runs. The no-JS guarantee holds;
 * the section moves. Only `y` and `scale` are ever initialised, never `opacity`.
 *
 * ── WHAT WAS CONSIDERED AND REJECTED ─────────────────────────────
 * - **A tile or bento grid.** Already tried and removed; `skills-section.tsx`
 *   records that bordered tiles spent a lot of visual weight on conveying a list.
 * - **Proficiency meters.** Rejected in the data layer already, for good reason.
 * - **A tag cloud or constellation.** Destroys the grouping that makes 40 items
 *   scannable in the first place.
 * - **Filter chips or a search box.** Hides items, which works against both the
 *   quick-scan goal and this site's rule that nothing is dimmed or concealed.
 */

/**
 * Items animated individually inside a block. A nine-item group would otherwise
 * stagger long enough to look like a loading state, and the eye is reading the
 * first few lines anyway. The rest simply appear with their block.
 */
const STAGGER_CAP = 10;

/**
 * The hover and press spring. These are `dragging-ball.tsx`'s numbers, unchanged:
 * the whole point of borrowing the technique is that it is the same one.
 */
const TAP_SPRING = { type: "spring", stiffness: 520, damping: 24, mass: 0.6 } as const;

/** Looser than a press, because an entrance has further to travel than a squeeze. */
const ENTER_SPRING = { type: "spring", stiffness: 380, damping: 32, mass: 0.7 } as const;

/** How far the segment's contents lean toward the pointer, px. */
const LEAN_MAX = 4;

/**
 * Per-item delay when a category's technologies deal out, in ms. Faster than
 * `radial-menu.tsx`'s 28ms because these are lines of text rather than discs on
 * an arc, and text that arrives slowly is text nobody reads.
 */
const CASCADE_STAGGER = 26;

/**
 * The category is always the first, and the AI group always leads, so the
 * positioning is carried by order and contrast rather than by a size difference.
 */
const PRIMARY_GROUP_ID = "ai-ml";

/** Shared empty set, so the default does not allocate on every render. */
const EMPTY: ReadonlySet<string> = new Set();

/**
 * The two text weights, and the reason there is no third.
 *
 * An earlier version dropped inactive groups toward the background to emphasise
 * one. Measured, it was a straight WCAG AA failure, because element opacity
 * composites against the page background before contrast is evaluated:
 *
 * | text | at rest | dimmed to 0.55 |
 * |---|---|---|
 * | muted body, dark page | 7.7:1 | **3.01:1** |
 * | muted body, light page | 4.74:1 | **2.12:1** |
 *
 * Ten of seventeen samples failed in dark and twelve in light. So emphasis here
 * moves a token toward `foreground` and never toward transparency: the inactive
 * groups hold full contrast and are distinguished by their rule and heading
 * weight, which is a shape difference rather than a legibility one.
 */
const AT_REST = "text-muted-foreground";
const EMPHASISED = "text-foreground";

export type SkillsIndexProps = {
  groups: readonly TechGroup[];
  /**
   * Ids drawn at full contrast instead of muted. Used for the tools the
   * production work runs on, so emphasis stays inside the category that owns
   * them rather than moving them somewhere else.
   */
  highlightedIds?: ReadonlySet<string>;
  className?: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * One technology. A line of icon and name, as text rather than a tile.
 *
 * The `scale` cascade is the `radial-menu.tsx` idea applied down a list: the
 * selected category's technologies spring to full size in sequence rather than
 * all at once, so a category reads as being dealt out rather than switched on.
 * `scale` is used and not `y` on purpose — the column's entrance owns `y`, and
 * two animations writing one value is how they end up fighting.
 */
function TechItem({
  tech,
  index,
  highlighted,
  active,
  reduced,
}: {
  tech: TechGroup["items"][number];
  index: number;
  highlighted: boolean;
  active: boolean;
  reduced: boolean;
}) {
  const body = (
    <>
      <TechIcon
        name={tech.icon}
        className={cn(
          "size-4 shrink-0 transition-transform duration-150 ease-out group-hover/item:-translate-y-px",
          highlighted ? "text-foreground/80 group-hover/item:text-foreground" : AT_REST,
          "group-hover/item:text-foreground",
        )}
      />
      <span
        className={cn(
          "text-sm leading-tight transition-colors duration-150 ease-out group-hover/item:text-foreground",
          highlighted ? "font-medium text-foreground" : AT_REST,
        )}
      >
        {tech.name}
      </span>
    </>
  );

  /* Reduced motion renders the PLAIN element, never `motion.*`. See the note on
     `CategoryBlock` — `initial={false}` still ships the `initial` values into the
     server HTML and relies on the client to paint them back, and a plain element
     has no failure mode at all. */
  if (reduced) {
    return (
      <li className="group/item flex items-center gap-2 py-0.5">
        {body}
      </li>
    );
  }

  return (
    <motion.li
      className="group/item flex items-center gap-2 py-0.5"
      initial={{ scale: 0.94 }}
      animate={{ scale: active ? 1 : 0.94 }}
      /* `radial-menu.tsx` staggers its fan with `transitionDelay: i * stagger`;
         this is the same shape, and the delay only applies while a category is
         selected so an unselected list settles as one thing. */
      transition={{
        ...ENTER_SPRING,
        delay: active ? Math.min(index, STAGGER_CAP) * (CASCADE_STAGGER / 1000) : 0,
      }}
      style={{ transformOrigin: "left center" }}
    >
      {body}
    </motion.li>
  );
}

/**
 * One composition-bar segment.
 *
 * A child component rather than an inline map body, because `useMotionValue`,
 * `useSpring` and `useTransform` are hooks and hooks cannot be called in a loop.
 *
 * **The pointer lean.** `lean` is a spring, not a plain transform, so the
 * contents glide to where the pointer is and settle when it stops, the way the
 * ball's squash settles. It reads the pointer's offset from this segment's own
 * centre, normalised to -1..1, so leaning into one segment does not move its
 * neighbours.
 *
 * **The rect is cached on enter, not read per move.** `getBoundingClientRect` is
 * a layout read; doing it inside a `pointermove` handler forces layout every
 * frame. The button's box is stable — every transform here is on a child, never
 * on the button — so one measurement per gesture is enough. `raj-ball.tsx` makes
 * the same trade, measuring the viewport once rather than per frame.
 */
function BarSegment({
  group,
  share,
  total,
  active,
  pinned,
  reduced,
  onPreview,
  onPin,
}: {
  group: TechGroup;
  share: number;
  total: number;
  active: boolean;
  pinned: boolean;
  reduced: boolean;
  onPreview: (id: string | null) => void;
  onPin: (id: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const rect = useRef<DOMRect | null>(null);

  const pointer = useMotionValue(0);
  /* Under-damped on purpose: a critically damped spring arrives and stops, and
     the overshoot is what makes it feel like mass. */
  const lean = useSpring(pointer, { stiffness: 260, damping: 26, mass: 0.5 });
  const shift = useTransform(lean, (v) => v * LEAN_MAX);

  const percent = Math.round(share * 100);

  const read = useCallback(() => {
    if (ref.current) rect.current = ref.current.getBoundingClientRect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pinned}
      /* The count is in the accessible name, not only in the bar, so the
         proportion is available without seeing the visual. */
      aria-label={`${group.label}, ${group.items.length} of ${total} tools, ${percent} percent`}
      onPointerEnter={() => {
        read();
        onPreview(group.id);
      }}
      onPointerMove={(event) => {
        const r = rect.current;
        if (!r || reduced) return;
        const half = r.width / 2 || 1;
        pointer.set(clamp((event.clientX - (r.left + half)) / half, -1, 1));
      }}
      onPointerLeave={() => {
        pointer.set(0);
        onPreview(null);
      }}
      onFocus={() => onPreview(group.id)}
      onBlur={() => onPreview(null)}
      onClick={() => onPin(group.id)}
      style={{ flexGrow: Math.max(0.001, share), flexBasis: 0 }}
      className={cn(
        "group/seg relative flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
      )}
    >
      {/* The fill. A child, not the button, so every transform below leaves the
          button's own layout box alone and the cached rect stays valid.

          The resting alpha is THEME-RELATIVE and not a taste call. The first
          version used `bg-muted-foreground/25`, on the reasoning that the
          proportions are also stated in text and so the fill is decorative.
          Measured, it was 1.47:1 against the dark page and 1.37:1 against the
          light one. That argument could be made to work, but it argues for an
          exemption on a graphic whose whole job is to be read as a chart, so the
          fill was made to clear 3:1 instead.

          A single alpha cannot do it. `muted-foreground` is light in the dark
          theme and dark in the light one, and the two need different mixes:

          | alpha | dark seg-vs-page | light seg-vs-page |
          |---|---|---|
          | 25% | 1.47:1 | 1.37:1 |
          | 55% | 2.98:1 | 2.12:1 |
          | 65% | **3.79:1** | 2.49:1 |
          | 85% | 5.76:1 | **3.54:1** |

          So the resting fill is 65% in dark and 85% in light. The count text
          stays `text-foreground`, which clears 4.5:1 on both of those fills
          (5.25:1 and 5.61:1) — the two constraints squeeze from opposite ends and
          these are the values where both hold at once. */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ scaleY: active ? 1 : 0.78 }}
        whileHover={reduced ? undefined : { scaleY: 0.9 }}
        whileTap={reduced ? undefined : { scaleY: 0.62 }}
        transition={reduced ? { duration: 0 } : TAP_SPRING}
        className={cn(
          "absolute inset-0 rounded-sm transition-colors duration-300 ease-out",
          active ? "bg-foreground" : "bg-muted-foreground/85 dark:bg-muted-foreground/65",
        )}
        style={{ transformOrigin: "center" }}
      />

      {/* The contents, leaning toward the pointer.

          `pointer-events-none` is load-bearing, and it was a measured bug rather
          than a precaution: this span sits ABOVE the fill, so it was the hit
          target and the fill's `whileHover`/`whileTap` never fired. Measured
          press: the fill went 1 -> 1.003 -> 1 instead of squashing, because the
          press simply was not reaching it.

          Letting events fall through puts the fill back in front as the direct
          target, and clicks still work because a press on a child bubbles to the
          `<button>` that owns both. */}
      <motion.span
        style={{ x: shift }}
        className="pointer-events-none relative flex flex-col items-center justify-center"
      >
        <span
          aria-hidden="true"
          className={cn(
            "font-mono text-[11px] leading-none tabular-nums transition-colors duration-300 ease-out",
            active ? "text-background" : EMPHASISED,
          )}
        >
          {group.items.length}
        </span>
        {/* Rendered only when the share is wide enough to hold the word, decided
            by comparing the known ratio rather than by measuring the DOM: the
            proportion is already in hand, so there is nothing to measure. At
            320px that means three of seven are labelled and four show only a
            count, instead of seven truncated words. */}
        {share >= LABEL_MIN_SHARE ? (
          <span
            aria-hidden="true"
            /* `text-foreground`, not `AT_REST`. It was muted originally, which is
               invisible: the fill beneath it is itself a muted-foreground, so the
               label was muted-on-muted at 2.03:1 dark and 1.34:1 light. */
            className={cn(
              "mt-0.5 truncate px-1 text-[10px] leading-none transition-colors duration-300 ease-out",
              active ? "text-background" : EMPHASISED,
            )}
          >
            {group.short}
          </span>
        ) : null}
      </motion.span>
    </button>
  );
}

/**
 * The composition bar: one segment per category, `flexGrow` set to the category's
 * item count so the widths are the proportions themselves.
 *
 * A `<button>` per segment whose transform-stable box carries the flex ratio, so
 * the ratio is the layout and cannot drift from the data the way an animated
 * width could.
 *
 * `flexGrow` here IS the ratio, which is why the `experience-timeline.tsx` bug —
 * grow set per segment rather than on the group wrapping them — cannot happen in
 * this component: each bar segment is one element.
 */
const LABEL_MIN_SHARE = 0.15;

function CompositionBar({
  groups,
  total,
  activeId,
  pinnedId,
  reduced,
  onPreview,
  onPin,
}: {
  groups: readonly TechGroup[];
  total: number;
  activeId: string | null;
  pinnedId: string | null;
  reduced: boolean;
  onPreview: (id: string | null) => void;
  onPin: (id: string) => void;
}) {
  return (
    <div
      /* A row of toggle buttons, not a tablist: there is no panel being swapped,
         the emphasis applies to a region of the same page. `role="group"` with a
         name is the honest structure. */
      role="group"
      aria-label="Skill categories by share of the stack"
      className="flex h-11 w-full items-stretch gap-0.5"
    >
      {groups.map((group) => (
        <BarSegment
          key={group.id}
          group={group}
          share={total > 0 ? group.items.length / total : 0}
          total={total}
          active={activeId === group.id}
          pinned={pinnedId === group.id}
          reduced={reduced}
          onPreview={onPreview}
          onPin={onPin}
        />
      ))}
    </div>
  );
}

/**
 * One category: a mono header carrying its count, a rule, and its technologies
 * listed underneath.
 *
 * Deliberately has no container. The tile grid this replaced spent forty borders
 * and shadows conveying a list, which fought the rest of the site: the notch, the
 * toggle and the hero are all flat, hairline-separated and typographic.
 */
function CategoryBlock({
  group,
  index,
  highlightedIds,
  reduced,
  active,
  onPreview,
}: {
  group: TechGroup;
  index: number;
  highlightedIds: ReadonlySet<string>;
  reduced: boolean;
  active: boolean;
  onPreview: (id: string | null) => void;
}) {
  const isPrimary = group.id === PRIMARY_GROUP_ID;

  /* The primary group leads, so it keeps the sheen on its rule; the emphasised
     state is a different signal (it moves on hover) and is carried by the rule
     and the heading instead of the text colour alone. */
  const ruleActive = active || isPrimary;

  const content = (
    <>
      <h3
        className={cn(
          "flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 ease-out",
          isPrimary || active ? EMPHASISED : AT_REST,
        )}
      >
        <span className="min-w-0 truncate">{group.label}</span>
        {/* The count beside the heading answers "how big is this category"
            without measuring the bar, and keeps the two in agreement.

            It is `text-muted-foreground`, NOT `opacity-70`. Opacity on text
            composites against the page background before contrast is evaluated,
            which is the exact defect recorded on `AT_REST`, and seven dimmed
            spans is seven chances to fail AA in one of the two themes. */}
        <span aria-hidden="true" className="shrink-0 tabular-nums text-muted-foreground">
          {group.items.length}
        </span>
      </h3>
      <div
        aria-hidden="true"
        className={cn(
          "mt-3 h-px transition-colors duration-300 ease-out",
          isPrimary ? "skills-sheen" : ruleActive ? "bg-foreground" : "bg-border",
        )}
      />
      <ul className="mt-3">
        {group.items.map((tech, itemIndex) => (
          <TechItem
            key={tech.id}
            tech={tech}
            index={itemIndex}
            highlighted={highlightedIds.has(tech.id)}
            active={active}
            reduced={reduced}
          />
        ))}
      </ul>
    </>
  );

  /* Hovering a column lights its segment in the bar. The reverse direction of
     the bar's own control, and deliberately mouse-only: it is pure emphasis, and
     everything it emphasises is already visible and reachable via the bar's seven
     buttons, so making the column a focus target as well would add seven more tab
     stops to a section that should be skimmable. */
  const wrapperProps = {
    onMouseEnter: () => onPreview(group.id),
    onMouseLeave: () => onPreview(null),
  };

  // See the note in `TechItem`: the plain branch is what guarantees the content
  // is visible when motion is unwelcome or not yet known.
  if (reduced) return <div {...wrapperProps}>{content}</div>;

  return (
    <motion.div
      {...wrapperProps}
      /* `initial={{ y: 10 }}`, NOT `initial={{ opacity: 0, y: 10 }}`.

         The server has to render this branch — `useReducedMotion()` is `null`
         there and `false` in the browser, so any other choice renders two trees
         and React reports a hydration mismatch on every load. A hardcoded
         `opacity: 0` would also ship into the static HTML, and a `whileInView`
         reveal that never fires without an IntersectionObserver would leave all
         forty technologies painted at zero with scripting off.

         `y: 10` alone is fully visible in the static HTML — ten pixels low, not
         invisible — and springs to rest when JS runs. This is what lets the
         section have an entrance at all while keeping the no-JS guarantee that
         `initial={false}` had bought. Only transform, never opacity. */
      initial={{ y: 10 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ ...ENTER_SPRING, delay: index * 0.055 }}
    >
      {content}
    </motion.div>
  );
}

export function SkillsIndex({
  groups,
  highlightedIds,
  className,
}: SkillsIndexProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  /* See `useHydrated` for what `hydrated` means. `reduced` is `false` until the
     client has taken over, so the server and the hydration render agree.

     A reduced-motion visitor therefore gets the animated branch for exactly one
     render and then the plain one, which is the only order that cannot
     mismatch: the alternative — deciding on the server that the visitor prefers
     reduced motion — is a guess, and guessing wrong is a hydration error on
     every page for everyone else. */
  const reduced = hydrated && reduceMotion === true;

  /*
    Two pieces of state, because "which category is emphasised" has two causes
    that must not fight. `pinnedId` is a decision — a click or a tap, which has to
    survive the pointer leaving. `previewId` is a hover or a focus, which must
    disappear the moment it ends.

    An explicit pin has to outrank a preview, so `pinnedId ?? previewId`. But
    "outrank" cannot simply be `pinnedId ?? previewId` alone: moving the pointer
    off the bar onto a column would drop the emphasis, and a keyboard reader who
    pins a category and then tabs into the list below would watch it switch off.
    The pin holds until Escape or a second activation of the same segment.
  */
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const activeId = pinnedId ?? previewId;

  const clearPin = useCallback(() => setPinnedId(null), []);
  useEscapeKey(pinnedId !== null, clearPin);

  const handlePin = useCallback((id: string) => {
    /* Activating the pinned segment again unpins it, so the control is a toggle
       rather than a one-way door. `setPinnedId` reads the previous value
       directly, which is the one place a functional update is required. */
    setPinnedId((current) => (current === id ? null : id));
  }, []);

  /* The denominator for the bar. One pass over the same array that renders the
     list, so the bar and the columns cannot disagree. */
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  const activeGroup = activeId
    ? groups.find((group) => group.id === activeId)
    : undefined;
  const activePercent =
    activeGroup && total > 0
      ? Math.round((activeGroup.items.length / total) * 100)
      : null;

  return (
    <div>
      <CompositionBar
        groups={groups}
        total={total}
        activeId={activeId}
        pinnedId={pinnedId}
        reduced={reduced}
        onPreview={setPreviewId}
        onPin={handlePin}
      />

      {/*
        The readout. `aria-hidden` because it restates what the pressed button's
        accessible name already says — "AI and machine learning, 9 of 40 tools, 23
        percent" — and announcing it again on every hover would make the section
        chatter under a pointer.

        `min-h` is set so swapping the text cannot reflow the list below it: the
        whole column grid shifts down by a line when the readout wraps to two
        lines, and a layout shift on hover is exactly the kind of thing that
        makes a section feel cheap.
      */}
      <p
        aria-hidden="true"
        /* A stable hook for the probes. The obvious selector —
           `[aria-hidden="true"].font-mono` — matches a bar segment's count span
           first, because that is earlier in the DOM and also `aria-hidden` and
           `font-mono`, so a test that used it read "9" as the readout text. */
        data-skills-readout=""
        className="mt-3 min-h-[2.5rem] font-mono text-xs text-muted-foreground"
      >
        {activeGroup && activePercent !== null ? (
          <>
            <span className="text-foreground">{activeGroup.label}</span>
            {` — ${activeGroup.items.length} of ${total} tools, ${activePercent}% of the stack`}
            {pinnedId === activeGroup.id ? " · pinned, Escape to clear" : null}
          </>
        ) : (
          `${total} tools across ${groups.length} categories, sized by share`
        )}
      </p>

      <div
        className={
          className ??
          "mt-6 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {groups.map((group, index) => (
          <CategoryBlock
            key={group.id}
            group={group}
            index={index}
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