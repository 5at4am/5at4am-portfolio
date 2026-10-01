"use client";

import { motion, useReducedMotion } from "motion/react";

import { TechIcon } from "@/components/ui/tech-icons";
import type { TechGroup } from "@/content/tech-stack";

/**
 * Items animated individually inside a block. A nine-item group would otherwise
 * stagger long enough to look like a loading state, and the eye is reading the
 * first few lines anyway. The rest simply appear with their block.
 */
const STAGGER_CAP = 10;

/**
 * The category is always the first, and the AI group always leads, so the
 * positioning is carried by order and contrast rather than by a size difference.
 */
const PRIMARY_GROUP_ID = "ai-ml";

/** Shared empty set, so the default does not allocate on every render. */
const EMPTY: ReadonlySet<string> = new Set();

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

/** One technology: an icon with its name beside it, as text rather than a tile. */
function TechItem({
  tech,
  index,
  highlighted,
  reduced,
}: {
  tech: TechGroup["items"][number];
  index: number;
  highlighted: boolean;
  reduced: boolean;
}) {
  const body = (
    <>
      <TechIcon
        name={tech.icon}
        className={
          highlighted
            ? "size-4 shrink-0 text-foreground/80 transition-transform duration-150 ease-out group-hover/item:-translate-y-px group-hover/item:text-foreground"
            : "size-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-hover/item:-translate-y-px group-hover/item:text-foreground"
        }
      />
      <span
        className={
          highlighted
            ? "text-sm font-medium leading-tight text-foreground transition-colors duration-150 ease-out"
            : "text-sm leading-tight text-muted-foreground transition-colors duration-150 ease-out group-hover/item:text-foreground"
        }
      >
        {tech.name}
      </span>
    </>
  );

  // Reduced motion, and the first render before the query resolves, both render
  // the plain element. `initial={false}` is not enough on its own: the hook
  // returns null before it settles, so a truthiness test would pick the animated
  // branch, apply `opacity: 0`, and then leave the content invisible for anyone
  // who has asked for reduced motion. Rendering the plain element means the
  // content is never hidden at all, which is the only ordering that is safe.
  if (reduced) {
    return <li className="group/item flex items-center gap-2 py-0.5">{body}</li>;
  }

  return (
    <motion.li
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.32,
        // Staggered off the block's own delay, and flat once past the cap so the
        // tail of a long group does not lag behind the reader.
        delay: Math.min(index, STAGGER_CAP) * 0.025,
      }}
      className="group/item flex items-center gap-2 py-0.5"
    >
      {body}
    </motion.li>
  );
}

/**
 * One category: a mono header, a rule, and its technologies listed underneath.
 *
 * Deliberately has no container. The tile grid this replaces spent thirty-eight
 * borders and shadows conveying a list, which fought the rest of the site: the
 * notch, the toggle and the hero are all flat, hairline-separated and typographic.
 */
function CategoryBlock({
  group,
  index,
  highlightedIds,
  reduced,
}: {
  group: TechGroup;
  index: number;
  highlightedIds: ReadonlySet<string>;
  reduced: boolean;
}) {
  const isPrimary = group.id === PRIMARY_GROUP_ID;

  const content = (
    <>
      <h3
        className={
          isPrimary
            ? "font-mono text-[11px] uppercase tracking-[0.14em] text-foreground"
            : "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
        }
      >
        {group.label}
      </h3>
      <div
        aria-hidden="true"
        className={isPrimary ? "skills-sheen mt-3 h-px" : "mt-3 h-px bg-border"}
      />
      <ul className="mt-3">
        {group.items.map((tech, itemIndex) => (
          <TechItem
            key={tech.id}
            tech={tech}
            index={itemIndex}
            highlighted={highlightedIds.has(tech.id)}
            reduced={reduced}
          />
        ))}
      </ul>
    </>
  );

  // See the note in `TechItem`: the plain branch is what guarantees the content
  // is visible when motion is unwelcome or not yet known.
  if (reduced) return <div>{content}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.055,
      }}
    >
      {content}
    </motion.div>
  );
}

/**
 * The skills section, as an index.
 *
 * Research on how portfolios are actually consumed drove this shape: a recruiter
 * spends roughly fifteen to thirty seconds on a resume and forty-five to ninety
 * seconds forming an impression from the site, so this section is optimised for
 * *reading a list quickly*, not for being a showcase. Every reference on that
 * subject agrees on grouping by category and on never showing proficiency
 * percentages, which are unmeasurable and read as filler. Hence categories, and
 * hence no self-assessed scores anywhere.
 *
 * Motion is deliberately per block rather than per item, and restrained: blocks
 * fade and rise on entry with a short stagger, items fade only, and the single
 * continuous animation on the page is the AI block's sheen, which exists to pull
 * the eye to the group that leads. Durations sit in the 150ms to 500ms band that
 * minimal portfolio systems specify, and the whole thing is skipped under
 * `prefers-reduced-motion` rather than shortened.
 *
 * Flat by design: no tiles, no borders around items, no shadows, no radii. That
 * matches the notch, the toggle and the hero, which is what the previous tile
 * grid did not.
 */
export function SkillsIndex({
  groups,
  highlightedIds,
  className,
}: SkillsIndexProps) {
  const reduceMotion = useReducedMotion();
  // Null means the query has not resolved yet. Treated as reduced, so the first
  // render is the visible plain markup rather than a hidden one waiting on an
  // animation that may never be allowed to run.
  const reduced = reduceMotion !== false;

  return (
    <div
      className={
        className ??
        "grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {groups.map((group, index) => (
        <CategoryBlock
          key={group.id}
          group={group}
          index={index}
          highlightedIds={highlightedIds ?? EMPTY}
          reduced={reduced}
        />
      ))}
    </div>
  );
}