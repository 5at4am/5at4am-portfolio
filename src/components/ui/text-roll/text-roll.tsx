"use client";

import { motion, useReducedMotion } from "motion/react";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

const STAGGER = 0.035;

export type TextRollProps = {
  /** Single-line text. Each character becomes an independently animated span. */
  children: string;
  className?: string;
  /** Stagger outward from the middle character instead of left to right. */
  center?: boolean;
  /**
   * Optional per-character class, so a wordmark can give some letters a
   * distinct treatment (e.g. the leet digits in `5at4am`). Applied to both
   * rolling layers, which stay metrical twins because the font is monospace.
   */
  charClass?: (char: string, index: number) => string | undefined;
};

/**
 * Hover-triggered vertical character roll, used for the header wordmark and
 * nav labels.
 *
 * Two stacked layers hold the same text: the base layer sits at `y: 0` and the
 * duplicate at `y: 100%`. On hover both translate to `-100%`, so the duplicate
 * appears to roll up over the base — a classic marquee reveal without a
 * library.
 *
 * The visible copy is `aria-hidden`; callers must supply their own accessible
 * label via `sr-only` text so the effect is never the only source of the name.
 *
 * @example
 * <a href="#top">
 *   <span className="sr-only">Satyam Raj, back to top</span>
 *   <TextRoll>5at4am</TextRoll>
 * </a>
 */
export function TextRoll({ children, className, center = false, charClass }: TextRollProps) {
  // `useReducedMotion()` can only read the media query in the browser, so the
  // server has no answer. Taking the branch immediately made the first client
  // render emit a single text node where the server had emitted one span per
  // letter, which React reports as a hydration mismatch (error #418) for anyone
  // with reduced motion switched on. Both hooks run unconditionally; the
  // reduced branch waits for hydration, by which point the server markup has
  // already been adopted and swapping to the static version costs nothing.
  const hydrated = useHydrated();
  const prefersReducedMotion = useReducedMotion();

  const letters = children.split("");

  const delayFor = (index: number) =>
    center ? STAGGER * Math.abs(index - (letters.length - 1) / 2) : STAGGER * index;

  if (hydrated && prefersReducedMotion) {
    // `aria-hidden` has to be here too, and it is not a detail. This branch
    // still renders the visible text; it just does not animate it. Callers
    // already pair TextRoll with an `sr-only` label, because the animated copy
    // is decorative — and `sr-only` is a CSS clip, NOT `aria-hidden`, so it is
    // always in the accessible name. Without this attribute both copies get
    // concatenated and every control announces itself twice: "AboutAbout",
    // "AchievementsAchievements", "Satyam Raj, back to top5at4am". Measured in
    // the accessibility tree, so it only bites people who have reduced motion
    // switched on — which is a real setting, not an edge case.
    return (
      <span aria-hidden="true" className={cn("block", className)}>
        {children}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("relative block overflow-hidden py-[0.1em]", className)}
    >
      {/* ── WHY THERE IS A WRAPPER IN HERE ────────────────────
          The roll layer is absolutely positioned, and on this root
          `inset-0` would resolve against its PADDING box — one
          `padding-top` above where the base copy sits in the
          content box. That 1.4px offset shows up twice, and both
          times it is the text itself that looks wrong:

            at rest, the incoming copy's ascenders peek in below
            the resting text. A ghost row of letter-tops under the
            wordmark, which is most of what made this look broken.

            at the end of the roll, the visible glyph snaps from
            15.8px to 14.4px — the roll copy lands where the base
            copy was NOT — and snaps back on the way out.

          This wrapper is the containing block for the roll layer
          instead, and it starts at the content box, so `inset-0`
          means the same line the base copy is on. The two layers
          are then aligned by construction, the travel distance is
          still exactly one line, and the padding is stated once. */}
      <div className="relative">
        <div>
          {letters.map((letter, index) => (
            <motion.span
              key={`base-${index}`}
              variants={{ initial: { y: 0 }, hovered: { y: "-100%" } }}
              transition={{ ease: "easeInOut", delay: delayFor(index) }}
              className={cn("inline-block", charClass?.(letter, index))}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        <div className="absolute inset-0">
          {letters.map((letter, index) => (
            <motion.span
              key={`roll-${index}`}
              variants={{ initial: { y: "100%" }, hovered: { y: 0 } }}
              transition={{ ease: "easeInOut", delay: delayFor(index) }}
              className={cn("inline-block", charClass?.(letter, index))}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>
    </span>
  );
}
