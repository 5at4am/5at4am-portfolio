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
    return <span className={cn("block", className)}>{children}</span>;
  }

  return (
    <span
      aria-hidden="true"
      className={cn("relative block overflow-hidden py-[0.1em]", className)}
    >
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
    </span>
  );
}
