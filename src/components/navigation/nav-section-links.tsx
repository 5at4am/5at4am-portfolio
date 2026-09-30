"use client";

import { cva } from "class-variance-authority";
import { motion } from "motion/react";

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
    },
    active: {
      true: "text-foreground",
      false:
        "text-muted-foreground hover:text-foreground focus-visible:text-foreground",
    },
  },
  compoundVariants: [
    { variant: "bordered", active: true, class: "border-foreground" },
  ],
  defaultVariants: { variant: "underline", active: false },
});

export type NavSectionLinksProps = {
  /**
   * - `underline` — desktop row with a shared-layout active indicator that
   *   slides between items.
   * - `bordered` — mobile stack with a left rule marking the active item.
   */
  variant: "underline" | "bordered";
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
  variant: "underline" | "bordered";
  onNavigate?: () => void;
}) {
  const showUnderline = isActive && variant === "underline";

  return (
    <li>
      <motion.a
        href={`#${section.id}`}
        initial="initial"
        whileHover="hovered"
        whileFocus="hovered"
        onClick={onNavigate}
        aria-current={isActive ? "location" : undefined}
        className={linkVariants({ variant, active: isActive })}
      >
        {/* TextRoll hides its own copy from assistive tech, so the label is
            provided here as real text. */}
        <span className="sr-only">{section.label}</span>
        <TextRoll className="leading-[1.1] py-[0.1em]">
          {section.label}
        </TextRoll>

        {showUnderline ? (
          <motion.span
            layoutId="nav-active-underline"
            className="absolute inset-x-2 -bottom-px h-px bg-foreground"
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
          />
        ) : null}
      </motion.a>
    </li>
  );
}

/**
 * Anchor links to every section on the home page, derived from
 * `NAV_SECTIONS`. Adding a section to that list wires it into both the desktop
 * row and the mobile panel with no further changes here.
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
        variant === "underline" ? "hidden items-center md:flex" : "flex flex-col",
        className
      )}
    >
      {NAV_SECTIONS.map((section) => (
        <NavSectionLink
          key={section.id}
          section={section}
          isActive={activeId === section.id}
          variant={variant}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}
