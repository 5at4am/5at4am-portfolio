"use client";

// `motion/react` is the `motion` package's own re-export of `framer-motion`
// (v12+), the same runtime the header, wordmark, and Skiper 4 buttons animate
// on. Importing `framer-motion` directly here would pull in a second copy.
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PRELOADER_WORDS, SITE } from "@/content/site";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

// ─── Timing ────────────────────────────────────────────────────────────────

/** Expo-out. Fast departure, long settle: the "expensive" feeling. */
const EASE_REVEAL: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Symmetric quart. Used for the exit wipe so the panel leaves as deliberately as it arrived. */
const EASE_WIPE: [number, number, number, number] = [0.76, 0, 0.24, 1];

/** Seconds for one word's vertical roll in. */
const REVEAL_SECONDS = 0.82;
/**
 * Seconds for one word's roll out. Deliberately shorter than the enter, and
 * shorter than `WORD_INTERVAL`, so a leaving word is always fully off the stage
 * before the next word starts leaving. That is what lets exactly two layers
 * exist at a time instead of a queue.
 */
const WORD_EXIT_SECONDS = 0.44;
/** Seconds between two characters starting their roll. */
const CHAR_STAGGER = 0.028;
/** Seconds for the panel to wipe off the top of the viewport. */
const WIPE_SECONDS = 0.85;

/**
 * Default ms a word holds the stage before the next one is scheduled. The list is
 * eight greetings long, so this is tuned to keep the whole run near 5.5s: every
 * word costs exactly one step, so the total scales linearly with it.
 */
const WORD_INTERVAL = 560;
/** ms per word when motion is reduced. A pause, not a performance. */
const REDUCED_INTERVAL = 260;

/** Fluid type size for the word. Tuned so "Bonjour" fills the measure and "你好" still fits. */
const WORD_SIZE = "clamp(2.75rem, 15vw, 10.5rem)";

/**
 * Geist carries Latin only, so the Cyrillic, Han, and Devanagari greetings fall
 * through to the platform UI font. Naming those scripts explicitly makes the
 * fallback a deliberate choice rather than whatever the UA reaches for first,
 * and keeps a missing font from rendering as tofu.
 */
const WORD_FONT_STACK =
  'var(--font-geist-sans), system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans JP", "Noto Sans SC", "Noto Sans Devanagari", sans-serif';

/**
 * The reveal is a single growing ellipse, not a rectangle wipe: `rx`/`ry` are
 * percentages of the word's own box, so starting at `2% 4%` gives a flat
 * sliver whose *edges are the curve* that opens across the letters. Both
 * keyframes carry the same four numbers and the same `at 50% 52%` anchor, which
 * is what lets Framer Motion interpolate them as a complex value.
 */
const CURVE_CLOSED = "ellipse(2% 4% at 50% 52%)";
const CURVE_OPEN = "ellipse(92% 130% at 50% 52%)";

const WORD_TYPE_CLASS =
  "flex items-start justify-center font-medium leading-none tracking-[-0.045em]";

/**
 * Split by grapheme cluster, not by code point.
 *
 * `Array.from("नमस्ते")` cuts the string between a consonant and the virama that
 * binds it to the next one, so that mark would end up alone on its own mask and
 * render as nothing at all. `Intl.Segmenter` keeps each akshara whole, which is
 * the whole reason a per-character reveal can carry a non-Latin word.
 */
const graphemeSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

/** Graphemes, falling back to code points on engines without `Intl.Segmenter`. */
function splitGraphemes(value: string): string[] {
  if (!graphemeSegmenter) return Array.from(value);
  return Array.from(graphemeSegmenter.segment(value), (part) => part.segment);
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * One word layer. `leaving` flips the whole reveal into reverse rather than
 * unmounting it, so the same element can play out and then leave without a
 * second component or a duplicated key.
 */
type WordSlot = {
  /** Equals the word's index, and is the React key, so a slot keeps its identity. */
  id: number;
  word: string;
  leaving: boolean;
};

export type WordsPreloaderProps = {
  /** Words revealed in order. Defaults to `PRELOADER_WORDS`. */
  words?: readonly string[];
  /** Milliseconds each word holds the stage before the next is scheduled. */
  wordInterval?: number;
  /** Fired once, when the overlay has finished leaving. */
  onComplete?: () => void;
  className?: string;
};

/**
 * Full-screen words preloader for a cold page load.
 *
 * **How it is built.** A fixed, always-dark panel with three bands: a small
 * mono brand row, the word stage, and a hairline progress bar. The stage is a
 * fixed-height `overflow-hidden` box in `em`, so words roll through it without
 * ever affecting page layout, and the type size is a single `clamp` shared by
 * the stage, the roll distance, and the arc beneath it.
 *
 * Each word is three nested reveals rather than one:
 * 1. the word layer slides `y: 112% -> 0%` while exiting to `-112%`, so the
 *    outgoing and incoming words overlap in a continuous roll;
 * 2. inside it, every character sits in its own `overflow-hidden` mask and
 *    rolls up on a `28ms` stagger, left to right;
 * 3. around both, `clip-path: ellipse()` grows from a sliver to cover the
 *    word, so the letters arrive behind a moving curve and collapse back
 *    through the same curve on the way out.
 *
 * A hairline arc redraws itself under each word (`pathLength` 0 -> 1) so the
 * curve is legible as a shape, not just as an edge.
 *
 * **Not in the server HTML.** `useHydrated` gates the first render, so a
 * visitor without JS - or a build that throws mid-animation - gets the site
 * rather than an opaque overlay with nothing behind it. Three independent
 * escape hatches cover the animated path: the `Skip` button, `Escape`, and a
 * watchdog timer armed with enough slack to outlast the whole run.
 *
 * **Home page only.** Mounted in `src/app/page.tsx`, not the root layout: the
 * intro is a greeting for one page, and `/paper` or a 404 should not pay for it.
 * Being in the page subtree means a client-side navigation back to `/` replays
 * the intro - the accepted trade for not charging it to every route.
 *
 * @example
 * <WordsPreloader />                                  // in src/app/page.tsx
 * <WordsPreloader words={["A", "B"]} wordInterval={400} />
 */
export function WordsPreloader({
  words = PRELOADER_WORDS,
  wordInterval = WORD_INTERVAL,
  onComplete,
  className,
}: WordsPreloaderProps) {
  const hydrated = useHydrated();
  // Read the media query unconditionally: `&&` would short-circuit past the
  // hook and change the hook order between renders. The answer is meaningless
  // before hydration anyway, and the overlay does not exist until then.
  const prefersReducedMotion = useReducedMotion();
  const reduced = hydrated && prefersReducedMotion === true;

  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  /**
   * The run: which word is current, and the layers currently mounted.
   *
   * Held as one state rather than two because they must change together. The
   * timer advances both in a single updater, so the outgoing word and the
   * incoming one are committed in the same render. Deriving the layers from
   * `index` in a second state instead costs an extra render pass per word, and
   * an effect-based version pops, because the old layer is already unmounted by
   * the time the replacement is queued.
   *
   * The layers are owned outright, oldest first, and never more than two.
   * `AnimatePresence` is deliberately not used for the roll: it unmounts an
   * exiting child only once every descendant reports its exit animation
   * complete, and with a masked per-character reveal nested inside each layer
   * that chain never resolves. Measured in a browser, all eight layers stayed
   * mounted for the entire run, animating eight words' worth of `clip-path` and
   * transform spans at once, and the run overshot its budget by ~1.3s doing it.
   * Owning the list keeps the DOM at two layers and makes the exit a duration
   * this file picks rather than one inferred from the subtree.
   *
   * Seeded with the first word so hydration never shows an empty stage for a
   * frame before the effect takes over.
   */
  const [run, setRun] = useState<{ index: number; slots: WordSlot[] }>(() => ({
    index: 0,
    slots: [{ id: 0, word: words[0] ?? "", leaving: false }],
  }));

  const { index, slots } = run;

  const exitedRef = useRef(false);

  const total = words.length;
  const lastIndex = Math.max(total - 1, 0);
  const step = reduced ? REDUCED_INTERVAL : wordInterval;
  const active = hydrated && !dismissed;

  // Read through a ref so an inline `onComplete` cannot change `dismiss`'s
  // identity, which would re-arm the word timer on every parent render and
  // restart the sequence mid-word.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    onCompleteRef.current?.();
  }, []);

  const beginExit = useCallback(() => {
    if (exitedRef.current) return;
    exitedRef.current = true;
    setExiting(true);
  }, []);

  /** A user-initiated skip must not wait on the wipe: arm a short backstop too. */
  const skip = useCallback(() => {
    beginExit();
    window.setTimeout(dismiss, WIPE_SECONDS * 1000 + 400);
  }, [beginExit, dismiss]);

  // One timer per word, not one per frame: `index` is the only value that
  // changes, so the progress bar and the counter step rather than tick.
  useEffect(() => {
    if (!active) return;

    const timer = window.setTimeout(() => {
      if (index >= lastIndex) {
        beginExit();
        return;
      }
      const next = index + 1;
      setRun((previous) => {
        // Retire the arriving word and admit the next one. `slice(-2)` drops the
        // layer that started leaving a full `step` ago; because the exit is
        // shorter than a step, that layer is already off the stage, so the
        // cap never truncates an animation mid-flight.
        const retiring = previous.slots
          .filter((slot) => !slot.leaving)
          .map((slot) => ({ ...slot, leaving: true }));
        const admitted = { id: next, word: words[next] ?? "", leaving: false };
        return { index: next, slots: [...retiring, admitted].slice(-2) };
      });
    }, step);

    return () => window.clearTimeout(timer);
  }, [active, index, lastIndex, step, beginExit, words]);

  // Watchdog. If a timer is dropped (backgrounded tab, throttled main thread)
  // or the wipe never reports completion, the overlay still comes down.
  useEffect(() => {
    if (!active) return;

    const budget = total * step + WIPE_SECONDS * 1000 + 1200;
    const timer = window.setTimeout(dismiss, budget);

    return () => window.clearTimeout(timer);
  }, [active, total, step, dismiss]);

  useBodyScrollLock(active);
  useEscapeKey(active, skip);

  const percent = total > 0 ? Math.round(((index + 1) / total) * 100) : 100;

  if (!active || total === 0) return null;

  return (
    <>
      <p role="status" className="sr-only">
        Loading {SITE.name}, {SITE.role}
      </p>

      <motion.div
        className={cn(
          "fixed inset-0 z-[100] flex select-none flex-col overflow-hidden bg-[#09090b] text-white",
          className
        )}
        // `initial={false}` means the resting position is painted, not
        // animated, so `onAnimationComplete` can only ever mean "the wipe ran".
        initial={false}
        animate={exiting ? { y: "-100%" } : { y: "0%" }}
        transition={{ duration: reduced ? 0.3 : WIPE_SECONDS, ease: EASE_WIPE }}
        onAnimationComplete={exiting ? dismiss : undefined}
      >
        {/* The content lags the panel on the way out, which reads as depth
            rather than as the whole screen sliding as one flat sheet. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          animate={reduced ? { opacity: exiting ? 0 : 1 } : { y: exiting ? "-12%" : "0%" }}
          transition={{ duration: reduced ? 0.3 : WIPE_SECONDS, ease: EASE_WIPE }}
        >
          <div className="flex shrink-0 items-center justify-between px-5 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 sm:px-8 sm:pt-7">
            <span aria-hidden="true">{SITE.handle}</span>
            <span aria-hidden="true">{SITE.domain}</span>
          </div>

          <div
            className="relative flex min-h-0 flex-1 select-none items-center justify-center overflow-hidden px-3"
            style={{ fontSize: WORD_SIZE, fontFamily: WORD_FONT_STACK }}
          >
            <div className="relative w-full" style={{ height: "1.1em" }}>
              {slots.map((slot) => (
                <motion.div
                  key={slot.id}
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={
                    reduced
                      ? { opacity: slot.leaving ? 1 : 0 }
                      : { y: slot.leaving ? "0%" : "112%" }
                  }
                  animate={
                    reduced
                      ? { opacity: slot.leaving ? 0 : 1 }
                      : { y: slot.leaving ? "-112%" : "0%" }
                  }
                  transition={
                    reduced
                      ? { duration: 0.24, ease: "linear" }
                      : {
                          duration: slot.leaving ? WORD_EXIT_SECONDS : REVEAL_SECONDS,
                          ease: EASE_REVEAL,
                        }
                  }
                >
                  <RevealWord word={slot.word} reduced={reduced} leaving={slot.leaving} />
                </motion.div>
              ))}
            </div>

            <svg
              viewBox="0 0 300 18"
              fill="none"
              aria-hidden="true"
              focusable="false"
              className="pointer-events-none absolute left-1/2 w-[min(58vw,420px)] -translate-x-1/2 text-white/25"
              style={{ top: "calc(50% + 0.82em)" }}
            >
              {/* Re-keyed per word so the arc redraws with the letterform. */}
              <motion.path
                key={index}
                d="M2 15C78 3 222 3 298 15"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={{ pathLength: reduced ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reduced ? 0 : REVEAL_SECONDS * 1.4,
                  ease: EASE_REVEAL,
                }}
              />
            </svg>
          </div>

          <div className="shrink-0 px-5 pb-5 sm:px-8 sm:pb-7">
            <div className="flex items-center justify-between gap-6">
              <span
                aria-hidden="true"
                className="font-mono text-[10px] tabular-nums uppercase tracking-[0.22em] text-white/45"
              >
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>

              <button
                type="button"
                onClick={skip}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white focus-visible:text-white"
              >
                Skip
              </button>
            </div>

            <div
              role="progressbar"
              aria-label="Loading progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-valuetext={`${index + 1} of ${total} words`}
              className="mt-3 h-px w-full bg-white/15"
            >
              <motion.div
                className="h-px w-full origin-left bg-white"
                initial={false}
                animate={{ scaleX: percent / 100 }}
                transition={{ duration: step / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ─── Word reveal ───────────────────────────────────────────────────────────

type RevealWordProps = {
  word: string;
  reduced: boolean;
  /** The slot is on its way out, so the reveal plays backwards from its rest state. */
  leaving: boolean;
};

/**
 * The curved, per-character half of the reveal.
 *
 * Each glyph gets its own `overflow-hidden` mask and rolls up on a stagger.
 * The masks carry `pb-`/`-mb-` in matching `em` so descenders (`j` in
 * "Bonjour") survive the clip without adding to the word's measured height.
 * That pairing only works because the row is `items-start`: with the default
 * `stretch`, flex would resolve the negative margin *out of* the item's height
 * and clip a third of every letter.
 *
 * `leaving` reuses the mounted element and simply retargets it at the incoming
 * state, so the characters unwind from wherever they were instead of snapping
 * to the start of the reverse animation.
 */
function RevealWord({ word, reduced, leaving }: RevealWordProps) {
  const characters = useMemo(() => splitGraphemes(word), [word]);

  if (reduced) {
    return (
      <motion.span
        className={cn(WORD_TYPE_CLASS, "items-center")}
        initial={{ opacity: leaving ? 1 : 0 }}
        animate={{ opacity: leaving ? 0 : 1 }}
        transition={{ duration: 0.24, ease: "linear" }}
      >
        {word}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={WORD_TYPE_CLASS}
      initial={leaving ? { clipPath: CURVE_OPEN } : { clipPath: CURVE_CLOSED }}
      animate={leaving ? { clipPath: CURVE_CLOSED } : { clipPath: CURVE_OPEN }}
      transition={{
        duration: leaving ? WORD_EXIT_SECONDS : REVEAL_SECONDS * 1.2,
        ease: EASE_REVEAL,
      }}
    >
      {characters.map((character, position) =>
        character === " " ? (
          <span key={`space-${position}`} className="w-[0.28em] shrink-0" />
        ) : (
          <span
            key={`${character}-${position}`}
            className="inline-block overflow-hidden pb-[0.18em] -mb-[0.18em]"
          >
            <motion.span
              className="inline-block"
              initial={{ y: leaving ? "0%" : "108%" }}
              animate={leaving ? { y: "-108%" } : { y: "0%" }}
              transition={{
                duration: leaving ? WORD_EXIT_SECONDS : REVEAL_SECONDS,
                ease: EASE_REVEAL,
                delay: position * CHAR_STAGGER,
              }}
            >
              {character}
            </motion.span>
          </span>
        )
      )}
    </motion.span>
  );
}
