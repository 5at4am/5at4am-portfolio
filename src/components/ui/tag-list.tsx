"use client";

import { motion, useReducedMotion } from "motion/react";

import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export type TagListProps = {
  items: readonly string[];
  /**
   * Accessible name for the list, e.g. `"CoalSutra stack"`. Announced by
   * screen readers so a bare run of tags is not read without context.
   */
  label: string;
  /** `onDark` restyles the chips for a dark-glass surface. */
  tone?: "default" | "onDark";
  /**
   * Subset of `items` to emphasise, by exact label.
   *
   * This is a COLOUR change only — never opacity. An earlier version of the
   * About section dimmed with `opacity-55`, which composites against the
   * surface before contrast is evaluated and measured as a hard WCAG AA failure:
   * 2.12:1 on a light background and 3.01:1 on a dark one. A chip that recedes
   * must recede by going greyer, not by going transparent.
   */
  litItems?: ReadonlySet<string>;
  /**
   * Promote the lit chips to the front of the list, animated.
   *
   * **Off by default**, and deliberately so: this is the only element on the page
   * that changes reading order, which makes it the one thing here that can be
   * more than a little clever. `project-accordion.tsx` renders `TagList` with
   * `litItems` set and must not have its stack reordered underneath a reader who
   * is reading a project description, so it leaves this off. The About section is
   * the one place the list is a short, self-contained answer to "which tools is
   * this", where promoting them is the point.
   *
   * Under reduced motion the reorder does not happen at all — the chips keep
   * their authored order and only the colour changes. Reordering is a change of
   * *content order*, and the one thing that must never be animated away from a
   * reader who cannot see it happen is a reordering.
   */
  promoteLit?: boolean;
  className?: string;
};

/**
 * Monospace chip list used for tech stacks and skill groups.
 *
 * `litItems` exists so a chip can answer "is this tool part of what I'm reading
 * about right now?" without the list reordering or the chip disappearing. The
 * lit chip takes the full ink; the rest take the muted one. Both states clear
 * 4.5:1, which is the point.
 */
export function TagList({
  items,
  label,
  tone = "default",
  litItems,
  promoteLit = false,
  className,
}: TagListProps) {
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  /*
   * A stable partition, not a sort.
   *
   * `sort` by "lit first" would reorder the unlit chips among themselves
   * whenever the lit set changed, because the comparator returns 0 for two
   * unlit items and leaves their relative order up to the engine — which for a
   * 8-item array is not a promise anyone should rely on. Two filtered passes
   * keep both groups in their authored order, so the only movement a reader ever
   * sees is the lit chips travelling forward.
   *
   * Gated on `hydrated` as well as `reduceMotion`. `reduceMotion !== true` alone
   * is `true` on the server and `false` in the browser, which would pick the
   * plain `<ul>` server-side and the `motion.li` list on the client: two
   * different element types, so a hydration mismatch on every load. Same reason
   * as `reduced` in `skills-index.tsx`.
   */
  const reorder = promoteLit && litItems !== undefined && hydrated && reduceMotion !== true;
  const ordered = reorder
    ? [
        ...items.filter((item) => litItems.has(item)),
        ...items.filter((item) => !litItems.has(item)),
      ]
    : items;

  const list = (
    <ul aria-label={label} className={cn("mt-4 flex flex-wrap gap-2", className)}>
      {ordered.map((item) => {
        const lit = litItems?.has(item) ?? false;
        return (
          <motion.li
            key={item}
            /* FLIP. Motion measures the chip's position before and after the
               reorder and animates the delta as a transform, so the chip slides
               to its new slot without the browser reflowing the list once per
               frame. `position: relative` is required for that measurement to be
               meaningful on a flex child.

               Only mounted when `reorder` is true — a `layout` prop on a list
               that is never reordering is a measurement taken on every render
               for nothing. */
            layout={reorder ? "position" : false}
            transition={
              reorder
                ? {
                    /* Snappier than a default spring and slightly under-damped,
                       so a chip arrives with a small settle rather than a wobble.
                       Deliberately faster than the 340ms wash: the chips are the
                       direct answer to the paragraph, and the wash is scenery. */
                    type: "spring",
                    stiffness: 420,
                    damping: 34,
                    mass: 0.7,
                  }
                : undefined
            }
            className={cn(
              "relative rounded-sm border px-2 py-1 font-mono text-xs transition-colors duration-200 ease-out",
              tone === "onDark"
                ? lit
                  ? "border-white/35 bg-white/15 text-zinc-50"
                  : "border-white/10 bg-white/5 text-zinc-100/70"
                : lit
                  ? "border-foreground/35 bg-foreground/10 text-foreground"
                  : "border-border text-muted-foreground",
            )}
          >
            {item}
          </motion.li>
        );
      })}
    </ul>
  );

  /*
   * Reduced motion gets a plain `<ul>` of plain `<li>`.
   *
   * Not `motion.li` with `initial={false}`: the reason the reduced branch in
   * `SkillsIndex` and `AboutSection` exists at all is that `initial={{ opacity: 0 }}`
   * ships in the server HTML and leaves content invisible without JavaScript. The
   * same discipline applies here — `motion.li` with `layout={false}` still emits
   * motion bookkeeping for a list that is not moving, and the plain element has no
   * failure mode at all.
   */
  if (!reorder) {
    return (
      <ul aria-label={label} className={cn("mt-4 flex flex-wrap gap-2", className)}>
        {items.map((item) => {
          const lit = litItems?.has(item) ?? false;
          return (
            <li
              key={item}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-xs transition-colors duration-200 ease-out",
                tone === "onDark"
                  ? lit
                    ? "border-white/35 bg-white/15 text-zinc-50"
                    : "border-white/10 bg-white/5 text-zinc-100/70"
                  : lit
                    ? "border-foreground/35 bg-foreground/10 text-foreground"
                    : "border-border text-muted-foreground",
              )}
            >
              {item}
            </li>
          );
        })}
      </ul>
    );
  }

  return list;
}