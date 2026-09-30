"use client";

import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useCallback, useState } from "react";

import { NavIconLinks } from "./nav-icon-links";
import { NavMobilePanel } from "./nav-mobile-panel";
import { NavSectionLinks } from "./nav-section-links";
import { TextRoll } from "@/components/ui/text-roll/text-roll";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NAV_SECTIONS, SCROLL_OFFSET } from "@/content/navigation";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

const SECTION_IDS = NAV_SECTIONS.map((section) => section.id);

/**
 * Sticky site header: wordmark, section links, social rail, and the mobile
 * menu trigger.
 *
 * The only state this component owns is whether the mobile panel is open.
 * Active-section tracking lives in `useScrollSpy`, and the panel's side effects
 * live with the panel.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { activeId, isScrolled } = useScrollSpy(SECTION_IDS, SCROLL_OFFSET);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-background/85 backdrop-blur-sm transition-colors",
        isScrolled ? "border-border" : "border-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:px-6"
      >
        <motion.a
          href="#top"
          initial="initial"
          whileHover="hovered"
          className="mr-auto shrink-0 font-mono text-sm font-semibold tracking-tight text-foreground"
        >
          <span className="sr-only">Satyam Raj, back to top</span>
          <TextRoll className="leading-[1.1] py-[0.1em]">5at4am</TextRoll>
        </motion.a>

        <NavSectionLinks variant="underline" activeId={activeId} />

        <div className="hidden md:block">
          <NavIconLinks />
        </div>

        <ThemeToggle className="ml-1" />

        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="primary-menu"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-accent focus-visible:bg-accent md:hidden"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </nav>

      <NavMobilePanel open={open} activeId={activeId} onClose={close} />
    </header>
  );
}
