"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useRef, useState } from "react";

import { Section } from "@/components/ui/section";
import { TagList } from "@/components/ui/tag-list";
import { EyeTracker } from "@/components/ui/eye-tracker/eye-tracker";
import { useHydrated } from "@/hooks/use-hydrated";
import { ABOUT, EDUCATION, type AboutParagraph } from "@/content/site";

export type AboutSectionProps = {
  /**
   * - `default` — resume page: two-column layout. Left is the narrative
   *   (lead sentence, highlighted-keyword paragraphs, availability pill);
   *   right is a fact sheet of dark-glass cards (stack chips + education rows).
   * - `terminal` — profile page: education continues the bio as a paragraph,
   *   since the score already appears in the profile meta row.
   */
  variant?: "default" | "terminal";
};

/**
 * The shape the eye-tracker holds for each stop.
 *
 * Indexed to `ABOUT.focus`, so it is one position per paragraph. Chosen so the
 * morph is legible as a change of character rather than a wobble: a circle
 * becoming a hexagon, a hexagon becoming a square.
 */
const TRACKER_SHAPES = ["Circle", "Hexagon", "Cube"] as const;

/**
 * Milliseconds between one highlighted phrase igniting and the next.
 *
 * 40ms is under the ~100ms at which a sequence stops reading as one gesture and
 * starts reading as several, which is the whole point of staggering them.
 */
const WASH_STAGGER = 40;

/**
 * Where the reading line sits, as a fraction of the viewport height.
 *
 * `0.42` rather than the middle: a paragraph becomes active when its centre
 * crosses slightly above centre, so a paragraph has "started" before it reaches
 * the eye's natural resting point and has finished before it leaves it.
 */
const READING_LINE = 0.42;

/** Escapes regex metacharacters so highlight phrases can appear verbatim. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * One paragraph, with the listed phrases wrapped in an ink-wash accent mark.
 * Phrases are split on verbatim, case-sensitive matches so the wash only lands
 * on the exact words in the copy.
 *
 * `wash` drives the ignition: `--about-wash` is a registered custom property
 * (see `globals.css`) that the gradient's colour-mix multiplies, so the wash
 * deepens rather than a second layer fading over it. Each mark is staggered by
 * `position * WASH_STAGGER`, which is what makes the phrases fill in left to
 * right instead of all at once.
 */
function HighlightedParagraph({
  text,
  highlights = [],
  active,
}: AboutParagraph & { active: boolean }) {
  const rest = "leading-relaxed text-muted-foreground transition-colors duration-200 ease-out";
  const lift = "leading-relaxed text-foreground transition-colors duration-200 ease-out";

  if (highlights.length === 0) {
    return <p className={active ? lift : rest}>{text}</p>;
  }

  const pattern = new RegExp(`(${highlights.map(escapeRegExp).join("|")})`, "g");
  const parts = text.split(pattern);

  /*
   * The stagger index, computed rather than counted during render.
   *
   * A `let` incremented inside the `map` is a mutation of a value owned by the
   * render, which the `react-hooks/immutability` rule rejects — correctly, since
   * a re-render would resume from whatever the previous pass left behind.
   * `parts.slice(0, index).filter(isHighlight).length` is a pure function of
   * `parts`, so it is stable across renders and reorders.
   */
  const isHighlight = (part: string) => highlights.includes(part);

  return (
    <p className={active ? lift : rest}>
      {parts.map((part, index) => {
        if (!isHighlight(part)) {
          return <span key={index}>{part}</span>;
        }
        const position = parts.slice(0, index).filter(isHighlight).length;
        return (
          <mark
            key={index}
            className="about-highlight bg-transparent font-medium text-foreground"
            style={
              {
                "--about-wash": active ? 1 : undefined,
                transitionDelay: `${position * WASH_STAGGER}ms`,
              } as React.CSSProperties
            }
          >
            {part}
          </mark>
        );
      })}
    </p>
  );
}

/** One label/value row of the education fact sheet. */
function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-white/10 py-2.5 first:border-t-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-100/60">
        {label}
      </dt>
      <dd className="text-right text-sm text-zinc-100">{value}</dd>
    </div>
  );
}

/** Shared dark-glass surface, tuned to the header notch and the toggle chip. */
const glassCard = "rounded-xl border border-white/10 bg-zinc-950/85 p-5 shadow-lg shadow-black/10 backdrop-blur-md";

/**
 * Bio and education. Shared by the home resume and the profile page; both read
 * from `ABOUT` / `EDUCATION` in the content layer.
 */
export function AboutSection({ variant = "default" }: AboutSectionProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  /* See `reduced` in `SkillsIndex`. The short version, because getting this
     wrong is not subtle: `useReducedMotion()` returns `null` on the server and
     `false` in the browser for anyone who has not asked for reduced motion, so
     `reduceMotion !== false` is `true` on the server and `false` on the client.
     That renders two different trees and React reports a hydration mismatch on
     every load — which is exactly what happened here. `hydrated` is `false` for
     the server AND the hydration render, so both agree. */
  const reduced = hydrated && reduceMotion === true;

  /* Which paragraph is being read. `null` means "none", which is a real state:
     above the first paragraph and below the last there is nothing to ignite, and
     forcing one would light a paragraph the reader is not on. */
  const [active, setActive] = useState<number | null>(null);
  /* Pointer and keyboard override the scroll position while they last, so a
     reader who stops on a paragraph keeps it lit instead of having the next one
     take over the moment they stop scrolling. */
  const [pinned, setPinned] = useState<number | null>(null);

  const narrativeRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const current = pinned ?? active;

  /*
   * The reading line.
   *
   * Deliberately NOT `useScroll` + a transform: that would put a scroll-scrubbed
   * value in charge of React state and re-render the section on every frame of
   * the scroll. This reads the raw `scrollY` and only calls `setActive` when the
   * *index* actually changes, which is at most three times per pass through the
   * section.
   *
   * `useMotionValueEvent` rather than a scroll listener, because `scrollY` is
   * already a motion value read on the compositor and this reuses it rather than
   * adding a second source of truth for the same number.
   */
  useMotionValueEvent(scrollY, "change", () => {
    const container = narrativeRef.current;
    if (!container) return;

    const reads = ABOUT.focus.map((paragraph) => {
      const el = container.querySelector<HTMLElement>(`[data-about-paragraph="${paragraph.text.slice(0, 24)}"]`);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });
    if (reads.some((value) => value === null)) return;

    const line = window.innerHeight * READING_LINE;
    /* The nearest paragraph to the reading line, which is stable in both
       directions. A "first one below the line" rule would flicker between two
       paragraphs exactly when they are equidistant, which is where a reader is
       most likely to be looking. */
    let nearest = 0;
    let best = Infinity;
    reads.forEach((value, index) => {
      const distance = Math.abs((value as number) - line);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });

    setActive((previous) => (previous === nearest ? previous : nearest));
  });

  if (variant === "terminal") {
    return (
      <Section id="about" title="About" variant={variant}>
        <div className="max-w-2xl space-y-5">
          <p className="leading-relaxed text-muted-foreground">{ABOUT.bio}</p>
          <p className="leading-relaxed text-muted-foreground">
            <strong className="font-medium text-foreground">
              {EDUCATION.degree}
            </strong>
            , {EDUCATION.institution}, {EDUCATION.period.replace("-", " to ")}.
          </p>
        </div>
      </Section>
    );
  }

  const narrative = (
    <div ref={narrativeRef} className="space-y-6">
      <div className="flex items-center gap-5 sm:gap-6">
        {/* The tracker's own frame is a fixed 200px so a wall of them never
            rescales the ball. `Ball` reads as an avatar at this size where
            the default `Cube` reads as a rounded square. The frame is
            centered in a box that owns the layout space, and the ball lands
            dead centre inside it.

            Its SHAPE now tracks the paragraph being read, which is the point of
            it being here at all: it was a blob following the cursor beside the
            lead sentence, doing nothing for the copy. `Circle` for the claim
            paragraph, `Hexagon` for the discipline one, `Cube` for the tools
            one — a change of character per claim rather than a wobble. */}
        <div className="relative size-24 shrink-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <EyeTracker
              size={96}
              shape={TRACKER_SHAPES[current ?? 0]}
              follow={55}
              bounce={25}
              tone="ink"
              decorative
            />
          </div>
        </div>
        <p className="text-lg font-medium leading-relaxed text-foreground">
          {ABOUT.lead}
        </p>
      </div>

      {ABOUT.focus.map((paragraph, index) => {
        const isActive = !reduced && current === index;
        const Wrapper = reduced ? "div" : "div";
        return (
          <Wrapper
            key={paragraph.text}
            /* `tabIndex` so the ignition is reachable by keyboard. No ARIA role
               and nothing is hidden behind it — this is a paragraph being read,
               not a control. The `data-` hook is how the reading line finds the
               element without a ref per paragraph. */
            tabIndex={0}
            data-about-paragraph={paragraph.text.slice(0, 24)}
            onMouseEnter={() => setPinned(index)}
            onMouseLeave={() => setPinned(null)}
            onFocus={() => setPinned(index)}
            onBlur={() => setPinned(null)}
            /* `border-l` + padding, not just spacing. An earlier pass carried the
               rhythm on `space-y-6` alone, and with three paragraphs that left
               24px between blocks — which reads as one continuous block of
               prose rather than three claims. The rule makes each paragraph a
               visible unit and gives the eye somewhere to land between them, and
               it fills from the left as the paragraph becomes the one being
               read. It is `currentColor` at low alpha for the same reason the
               wash is: a structural device that encodes which paragraph is
               active, not decoration.

               `outline-none` is correct here, not a suppression. The global
               `:focus-visible` rule draws a 2px outline, and this element also
               draws its own 2px left border — so before this, focusing a
               paragraph produced a full white rectangle around a block of prose
               (visible in a screenshot). A paragraph of body copy is not a
               control, and it has nothing to be operated; the left border, the
               wash and the lifted text colour are the entire focus treatment, and
               all three are visible. Keyboard users get the same state a pointer
               gets, which is what focus has to guarantee. */
            className="border-l-2 border-transparent pl-4 outline-none transition-colors duration-300 ease-out"
            style={
              isActive
                ? { borderLeftColor: "var(--foreground)" }
                : undefined
            }
          >
            <HighlightedParagraph {...paragraph} active={isActive} />
          </Wrapper>
        );
      })}
    </div>
  );

  /* The Stack chips light when the paragraph being read is the one that names
     them. The mapping is content, not design, so it lives in `site.ts` as
     `tools` on each paragraph and is applied here by label. A chip with no
     matching paragraph simply never lights, which is the honest outcome for
     `Next.js` and `TypeScript`: they are stack, not claims. */
  const litTools = new Set<string>(
    current === null
      ? []
      : ABOUT.focus[current]?.tools ?? [],
  );

  const facts = (
    <>
      <div className={glassCard}>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-100/60">
          Stack
        </h3>
        <TagList
          items={ABOUT.stack}
          label="Working stack"
          tone="onDark"
          litItems={litTools}
          promoteLit
        />
      </div>

      <div className={glassCard}>
        <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-100/60">
          Education
        </h3>
        <dl className="mt-3">
          <FactRow label="Degree" value={EDUCATION.degree} />
          <FactRow label="University" value={EDUCATION.institution} />
          <FactRow label="Period" value={EDUCATION.period.replace("-", " to ")} />
          <FactRow
            label="CGPA"
            value={EDUCATION.score.replace("CGPA ", "").replace("/", " / ")}
          />
        </dl>
      </div>
    </>
  );

  /*
   * The plain branch is the one that matters.
   *
   * `initial={{ opacity: 0 }}` is server-rendered, so with JavaScript disabled —
   * or a build that throws part-way through hydration — the narrative and the
   * whole fact sheet are painted at `opacity: 0` and never recover. Measured
   * with script execution disabled: both wrappers at `opacity: 0`, i.e. the
   * lead sentence, all three focus paragraphs and the Stack/Education cards
   * gone. That is the only substantial prose on the page.
   *
   * So the fallback renders ordinary elements rather than `motion.*` with
   * `initial={false}`. `initial={false}` would still ship the `opacity: 0`
   * inline style on the server and rely on the client to paint it back, which
   * is precisely the case that fails without JS.
   */
  if (reduced) {
    return (
      <Section id="about" title="About">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] md:gap-12">
          <div className="max-w-2xl space-y-5">{narrative}</div>
          <aside className="space-y-5" aria-label="Fast facts">
            {facts}
          </aside>
        </div>
      </Section>
    );
  }

  return (
    <Section id="about" title="About">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] md:gap-12">
        <motion.div
          /*
           * `initial={false}`, NOT `initial={{ opacity: 0, y: 14 }}`.
           *
           * This is the trade the hydration fix forces, and it is worth stating
           * plainly because it reverses an earlier decision in this file.
           *
           * The server MUST render the animated branch: `useReducedMotion()`
           * is `null` on the server and `false` in the browser, so any other
           * choice renders two different trees and React reports a hydration
           * mismatch on every load. That means the HTML ships here, and a
           * hardcoded `initial` puts `opacity: 0` in that HTML — content
           * present in the DOM (measured: 1017 chars, 8 marks, 8 chips, 4
           * education rows) but painted at zero, and never revealed without JS
           * because `whileInView` needs an observer to fire.
           *
           * `initial={false}` paints the resting state instead, so the server and
           * the hydration render agree AND the copy is visible without JS. The
           * cost is that the block no longer animates in on the client: it is
           * simply there. `whileInView` is still declared and still becomes a
           * no-op, which is fine because the target state IS the resting state.
           *
           * This is the same reasoning `words-preloader.tsx` uses — never ship a
           * hidden initial state — applied to a section rather than an overlay.
           * The trade is one entrance animation for a page that still reads
           * with scripting off.
           */
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl space-y-5"
        >
          {narrative}
        </motion.div>

        <motion.aside
          /* `initial={false}` for the reason on the narrative above. */
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="space-y-5"
          aria-label="Fast facts"
        >
          {facts}
        </motion.aside>
      </div>
    </Section>
  );
}