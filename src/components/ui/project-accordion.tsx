"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useState } from "react";

import { BulletList } from "@/components/ui/bullet-list";
import { ExternalLink } from "@/components/ui/external-link";
import { TagList } from "@/components/ui/tag-list";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePointerLight } from "@/hooks/use-pointer-light";
import { cn } from "@/lib/utils";
import type { Project } from "@/content/types";

/**
 * Deterministic surface for a project, in place of a screenshot.
 *
 * The original effect was built around a photo per row, but this portfolio has no
 * screenshots and inventing eight would mean showing something untrue. Instead each
 * project gets a surface derived from a hash of its own name, so a given project
 * always looks the same and no two are alike, with no assets to load.
 *
 * The hue is constrained to the project's own palette. Two rules from the design
 * system apply: no purple anywhere, and the tokens are zinc/`--vng`, so the hue
 * range here deliberately skips the violet band rather than using a full wheel.
 */
function surfaceFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const a = Math.abs(hash);
  // 18deg to 78deg and 168deg to 258deg: warm/amber and teal/blue-green only.
  const band = a % 2 === 0 ? [18, 78] : [168, 258];
  const hue = band[0] + (a % 1000) / 1000 * (band[1] - band[0]);
  const angle = a % 360;
  return {
    background: `radial-gradient(120% 140% at 18% 12%, oklch(0.42 0.09 ${hue.toFixed(0)} / 0.55) 0%, transparent 58%),
       radial-gradient(110% 120% at 88% 88%, oklch(0.34 0.07 ${((hue + 34) % 360).toFixed(0)} / 0.5) 0%, transparent 62%),
       linear-gradient(${angle.toFixed(0)}deg, oklch(0.24 0.02 ${hue.toFixed(0)}) 0%, oklch(0.17 0.015 ${hue.toFixed(0)}) 100%)`,
    hue,
  };
}

/* ── the panel's opening cascade ────────────────────────────────────
   `radial-menu.tsx` deals its fan out with `transitionDelay: i * stagger`. The
   same shape runs down this panel's contents so a project arrives rather than
   appearing. Slower than the fan's 28ms because these are paragraphs, not discs
   on an arc, and text that arrives slowly is text nobody reads.

   Transform-only — see `skills-index.tsx` for why an `opacity: 0` initial is
   never acceptable anywhere in this codebase. */
const CASCADE_STAGGER = 0.055;

/**
 * The target for one step of the cascade.
 *
 * `opacity` is 1 in BOTH states and never animated. That is what keeps the panel
 * readable with scripting off, and it is why the effect is a lift rather than a
 * fade: a fade would have to pass through zero, and zero is the one value that
 * makes the content disappear.
 *
 * **The delay does NOT live here.** `transitionDelay` placed inside an `animate`
 * object is silently ignored by framer — `animate` accepts only animatable
 * values — so the first version of this had all four blocks moving in lockstep,
 * measured at an identical `y: 4.73` and then an identical `y: 0`. The delay
 * belongs in the `transition` prop, which is what `cascadeTransition` is for.
 */
function cascade(open: boolean) {
  return { opacity: 1, y: open ? 0 : 6 };
}

function cascadeTransition(reduced: boolean, step: number) {
  return reduced
    ? { duration: 0 }
    : {
        type: "spring" as const,
        stiffness: 420,
        damping: 34,
        mass: 0.6,
        delay: step * CASCADE_STAGGER,
      };
}

function ProjectRow({
  project,
  index,
  open,
  onToggle,
  onHoverChange,
  panelId,
  buttonId,
}: {
  project: Project;
  index: number;
  open: boolean;
  onToggle: () => void;
  onHoverChange: (hovering: boolean) => void;
  panelId: string;
  buttonId: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const hydrated = useHydrated();
  const surface = surfaceFor(project.name);

  /* `hydrated &&`, NOT the raw `shouldReduceMotion`.

     `useReducedMotion()` returns `null` on the server but the real boolean on the
     client's FIRST render — it reads `matchMedia` synchronously. Testing it
     directly therefore picks two different branches: the server rendered this
     panel with a `style="transform: ..."` from the tilt, and a reduced-motion
     client rendered it with no transform at all, which React reports as a
     hydration mismatch on every load for exactly the people who asked for less
     motion. `hydrated` is false for the server and the hydration render alike, so
     both take the animated branch and the reduced branch arrives one render later.
     Same rule as `reduced` in `skills-index.tsx` and `experience-timeline.tsx`. */
  const reduced = hydrated && shouldReduceMotion === true;

  /* Destructured, not used as `light.x`: `react-hooks/refs` rejects any property
     access on an object that holds a ref, even for the sibling properties that
     have nothing to do with it. */
  const { ref, handlers, tiltStyle } = usePointerLight<HTMLDivElement>(reduced);

  return (
    <div data-project-row={project.name} data-open={open ? "true" : "false"}>
      {/*
        A real <button>, not a motion.div with onClick. The original used a
        div, which is not focusable and has no role: keyboard users could not
        reach it at all, and nothing announced it as expandable. A real button
        brings Enter/Space activation, form semantics and high-contrast handling
        with it, which is the same pattern site-header.tsx already uses for the
        mobile menu trigger.

        The name is INSIDE the button and is never animated, so it cannot be lost
        to a fade or a height collapse. That property is the whole reason the
        section is usable at a glance.
      */}
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onFocus={() => onHoverChange(true)}
        className={cn(
          "group flex min-h-[42px] w-full items-center gap-4 rounded-2xl border border-transparent px-4 text-left",
          "transition-[background-color,border-color,color] duration-300 ease-out",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
          /*
           * Theme-aware, not the always-dark glass the card stack used.
           *
           * The open row is a dark surface so the generative panel below it reads
           * as one object, and that needs light-on-dark. A COLLAPSED row sits
           * directly on the page background, which is near-white in the light
           * theme: `text-zinc-100` there measured as #f4f4f5 on #ffffff, about
           * 1.1:1, so all eight project names rendered as pale ghosts and the
           * section was unreadable until it was expanded. Only the expanded row
           * is a dark surface; collapsed rows use the page's own foreground.
           */
          open
            ? "border-white/10 bg-zinc-950/85 text-zinc-50"
            : "text-foreground hover:border-border hover:bg-muted/60"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "font-mono text-xs tabular-nums",
            open ? "text-zinc-400" : "text-muted-foreground"
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* The always-visible name. Never inside an animated wrapper.

            An `<h3>`, so a heading-outline walk finds the eight projects as the
            children of `h2 Projects`. They were bare `<span>`s in buttons, which
            meant the section exposed a heading with no children at all and
            broke outline parity with Experience - where the three roles are
            `<h3>` under `<h2>`. Eight project names are the section's entire
            navigation, so they are what someone skimming the outline is looking
            for.

            Legal inside a `<button>`, and it does not add a second stop to the
            accessible name: heading content is not concatenated into a button's
            name, so this announces as "ProjectName, collapsed, button" exactly
            as the span did. */}
        <h3 className="min-w-0 flex-1 truncate text-sm font-medium sm:text-base">
          {project.name}
        </h3>

        {!open && project.stack.length > 0 ? (
          <span
            aria-hidden="true"
            className={cn(
              "hidden items-center gap-1.5 text-xs sm:flex",
              "text-muted-foreground"
            )}
          >
            {project.stack.slice(0, 2).map((item) => (
              <span
                key={item}
                className="max-w-[9rem] truncate rounded-full border border-border/70 px-2 py-0.5"
              >
                {item}
              </span>
            ))}
            {project.stack.length > 2 ? (
              <span className="rounded-full border border-border/70 px-2 py-0.5">
                +{project.stack.length - 2}
              </span>
            ) : null}
          </span>
        ) : null}

        {/* The stack's signature gesture, kept: a line that draws out to the
            right on hover. Purely decorative, so it is hidden from assistive
            tech rather than being read as a character. */}
        <span aria-hidden="true" className="relative hidden h-px w-16 shrink-0 overflow-hidden sm:block">
          <span
            className={cn(
              "absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100",
              open ? "bg-zinc-400/60" : "bg-foreground/40"
            )}
          />
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full border transition-transform duration-300 ease-out",
            open
              ? "rotate-45 border-white/15 text-zinc-300"
              : "border-border text-muted-foreground group-hover:border-foreground/25 group-hover:text-foreground"
          )}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      {/*
        The panel stays MOUNTED whether or not it is open, and animates its height
        between 0 and auto. Unmounting it (the obvious approach) would be simpler
        but has two costs: the panel could not be marked `inert` while closed
        because it would not exist, and every open/close would remount the whole
        subtree, losing the tag list and re-running its layout.

        `inert` while collapsed is the important part. An animated height keeps the
        element laid out, so `overflow-hidden` alone would leave its links
        focusable and tabbable while entirely invisible — Tab would walk into a row
        the reader cannot see. This is the same fix radial-menu.tsx uses for its
        closed fan, and unlike a permanent `overflow-hidden` wrapper it does not
        clip focus rings.
      */}
      <motion.div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        inert={open ? undefined : true}
        data-project-panel={project.name}
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={
          /* `reduced`, not `shouldReduceMotion`, so the collapsed panel's inline
             `height` is identical on the server and the hydration render. */
          reduced
            ? { duration: 0.01 }
            : { duration: 0.42, ease: [0.32, 0.72, 0, 1] }
        }
        className="overflow-hidden"
      >
        {/* The generative surface. It is the reason a collapsed row is plain text
            and an open row is not: `surfaceFor` derives a stable gradient from the
            project's own name, so a project always looks the same and no two look
            alike, with no assets to load.

            The pointer spotlight and the tilt come from `use-pointer-light`, the
            same hook `glass-card.tsx` uses, so the two surfaces on this site
            behave identically. `panel-spot` is the element the hook writes
            `--light-x` / `--light-y` onto, and the gradient that reads them is in
            `globals.css`. It sits UNDER the content (`z-index: 0` against the
            content's `z-index: 2`) so it can never wash out the text — an earlier
            version had it above and the measured contrast of the muted line fell
            because of it. */}
        <div
          ref={ref}
          {...handlers}
          className="panel-spot relative overflow-hidden rounded-2xl border border-white/10"
          style={{ background: surface.background }}
        >
          <motion.div style={tiltStyle}>
            <div className="px-4 pb-6 pt-1 sm:px-6">
              {/*
                The cascade. `radial-menu.tsx` deals its options out with
                `transitionDelay: i * stagger`; this is the same idea applied to a
                panel's contents, so a project reads as arriving rather than
                appearing. Transform-only, staggered off the panel's own open, and
                gated on `open` so a collapsed panel is not holding twenty live
                animations.
              */}
              <motion.p
                className="max-w-prose text-sm leading-relaxed text-zinc-200/90"
                initial={false}
                animate={cascade(open)}
                transition={cascadeTransition(reduced, 0)}
              >
                {project.tagline}
              </motion.p>

              <motion.div
                initial={false}
                animate={cascade(open)}
                transition={cascadeTransition(reduced, 1)}
              >
                <BulletList
                  items={project.bullets}
                  className="mt-4 text-zinc-200/80"
                />
              </motion.div>

              <motion.div
                initial={false}
                animate={cascade(open)}
                transition={cascadeTransition(reduced, 2)}
              >
                <TagList
                  items={project.stack}
                  label={`${project.name} stack`}
                  tone="onDark"
                  className="mt-4"
                />
              </motion.div>

              <motion.p
                className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm"
                initial={false}
                animate={cascade(open)}
                transition={cascadeTransition(reduced, 3)}
              >
                {project.links.map((link) => (
                  <ExternalLink key={link.href} href={link.href} tone="onDark">
                    {link.label}
                  </ExternalLink>
                ))}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export type ProjectAccordionProps = {
  projects: readonly Project[];
  className?: string;
};

/**
 * Projects as a hover/click accordion: all eight names visible at once, one
 * expanded to its full write-up.
 *
 * Adapted from the Skiper UI `Skiper53` HoverExpand effect, which fixes two
 * things about the original that made it unusable here:
 *
 * 1. **The rows were `motion.div`s with `onClick`.** Not focusable, no role,
 *    unreachable by keyboard. Here each row is a real `<button>`, so Enter and
 *    Space work and `aria-expanded`/`aria-controls` can describe it properly.
 * 2. **Nothing could close the open row.** Activating the expanded row again now
 *    collapses it, and Escape closes the open row outright, reusing the project's
 *    existing `useEscapeKey` hook. This is the same disclosure model
 *    `radial-menu.tsx` uses: a control in normal page flow, no focus trap and no
 *    scroll lock, because a row expanding inside a scrolling page must not take
 *    the page away from the reader.
 *
 * Hover is additive rather than the only path, because `onHoverStart` never fires
 * on a touch device: click and keyboard are the primary routes, hover just
 * previews. Focus opens the row too, so tabbing through the section reads like
 * pointing at it.
 */
export function ProjectAccordion({ projects, className }: ProjectAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const baseId = useId();

  /*
   * Which row is showing.
   *
   * `openIndex` is an explicit choice, `hovered` a preview, and an explicit
   * choice has to win. But "win" cannot simply mean `openIndex ?? hovered`,
   * because that makes the row impossible to close while the pointer is still on
   * it: activating an open row sets `openIndex` to null and the `??` immediately
   * falls back to `hovered`, which is still that same row. The row stayed open and
   * pressing Enter again did nothing at all.
   *
   * So an explicit toggle-off also suppresses the hover preview, via `suppressed`,
   * until the pointer leaves and comes back. This is state rather than a ref
   * because it feeds the rendered `activeIndex`; `react-hooks/refs` rejects
   * reading a ref during render, and rightly so, since the value it gates is what
   * decides what is painted.
   */
  const [suppressed, setSuppressed] = useState(false);

  const activeIndex = openIndex ?? (suppressed ? null : hovered);

  const close = useCallback(() => {
    setOpenIndex(null);
    setHovered(null);
    setSuppressed(true);
  }, []);

  useEscapeKey(openIndex !== null, close);

  // Hovering a row again re-arms it after an explicit close.
  const handleHoverChange = useCallback((index: number, hovering: boolean) => {
    if (hovering) {
      setSuppressed(false);
      setHovered(index);
    } else {
      setHovered((current) => (current === index ? null : current));
    }
  }, []);

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {projects.map((project, index) => {
        const isOpen = activeIndex === index;
        return (
          <ProjectRow
            key={project.name}
            project={project}
            index={index}
            open={isOpen}
            panelId={`${baseId}-panel-${index}`}
            buttonId={`${baseId}-button-${index}`}
            onToggle={() => {
              // Toggling the open row shut closes it explicitly, which has to
              // outrank the hover preview or the row reopens immediately.
              if (openIndex === index) {
                setSuppressed(true);
                setOpenIndex(null);
              } else {
                setSuppressed(false);
                setOpenIndex(index);
              }
            }}
            onHoverChange={(next) => handleHoverChange(index, next)}
          />
        );
      })}
    </div>
  );
}
