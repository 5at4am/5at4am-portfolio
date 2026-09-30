"use client";

import { cva } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";

import { TextRoll } from "@/components/ui/text-roll/text-roll";
import { NAV_SECTIONS } from "@/content/navigation";
import type { NavSection } from "@/content/types";
import { cn } from "@/lib/utils";

const linkVariants = cva("block px-3 text-sm font-medium transition-colors", {
  variants: {
    variant: {
      /** Desktop row, paired with the sliding underline indicator. */
      underline: "relative py-2",
      /** Mobile stack, paired with the left rule. */
      bordered: "border-l-2 border-transparent py-2.5",
      /** Inside the top notch: always light, since the notch stays dark. */
      notch: "relative py-2",
    },
    active: {
      true: "text-foreground",
      false:
        "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
    },
  },
  compoundVariants: [
    { variant: "bordered", active: true, class: "border-foreground" },
    { variant: "notch", active: true, class: "text-zinc-100" },
    {
      variant: "notch",
      active: false,
      class: "text-zinc-100/70 hover:text-zinc-100 focus-visible:text-zinc-100",
    },
  ],
  defaultVariants: { variant: "underline", active: false },
});

export type NavSectionLinksProps = {
  /**
   * - `underline` — desktop row with a shared-layout active indicator that
   *   slides between items.
   * - `notch` — same row but tinted for the dark top notch surface.
   * - `bordered` — mobile stack with a left rule marking the active item.
   */
  variant: "underline" | "bordered" | "notch";
  activeId: string;
  /** Called after a section is chosen, so the mobile panel can close itself. */
  onNavigate?: () => void;
  className?: string;
};

function NavSectionLink({
  section,
  isActive,
  variant,
  onNavigate,
}: {
  section: NavSection;
  isActive: boolean;
  variant: "underline" | "bordered" | "notch";
  onNavigate?: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const showUnderline = isActive && (variant === "underline" || variant === "notch");
  const underlineClass = variant === "notch" ? "bg-zinc-100" : "bg-foreground";

  return (
    <li className="overflow-hidden">
      <motion.a
        href={`#${section.id}`}
        initial="initial"
        whileHover="hovered"
        whileFocus="hovered"
        onClick={onNavigate}
        aria-current={isActive ? "location" : undefined}
        className={cn(linkVariants({ variant, active: isActive }))}
      >
        {/* TextRoll hides its own copy from assistive tech, so the label is
            provided here as real text. */}
        <span className="sr-only">{section.label}</span>
        <TextRoll className="leading-[1.1] py-[0.1em]">
          {section.label}
        </TextRoll>

        {showUnderline ? (
          <motion.span
            layoutId={shouldReduceMotion ? undefined : "nav-active-underline"}
            className={cn(
              "pointer-events-none absolute inset-x-2 -bottom-px h-px",
              underlineClass
            )}
            transition={
              shouldReduceMotion
                ? { layout: { duration: 0 } }
                : {
                    layout: {
                      type: "tween",
                      duration: 0.35,
                      ease: [0.33, 1, 0.68, 1],
                    },
                  }
            }
          />
        ) : null}
      </motion.a>
    </li>
  );
}

/**
 * Anchor links to every section on the home page, derived from
 * `NAV_SECTIONS`. Adding a section to that list wires it into the mobile panel
 * with no further changes here. Desktop navigation uses the magnification dock
 * in the site header instead.
 */
export function NavSectionLinks({
  variant,
  activeId,
  onNavigate,
  className,
}: NavSectionLinksProps) {
  return (
    <ul
      className={cn(
        variant === "bordered"
          ? "flex flex-col"
          : "hidden items-center md:flex",
        className,
      )}
    >
      {NAV_SECTIONS.map((section) => (
        <NavSectionLink
          key={section.id}
          section={section}
          isActive={section.id === activeId}
          variant={variant}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}