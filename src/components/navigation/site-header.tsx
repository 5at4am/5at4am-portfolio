"use client";

import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useCallback, useState } from "react";

import { NavMobilePanel } from "./nav-mobile-panel";
import { NavSectionLinks } from "./nav-section-links";
import { TextRoll } from "@/components/ui/text-roll/text-roll";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NAV_SECTIONS, SCROLL_OFFSET } from "@/content/navigation";
import { useScrollSpy } from "@/hooks/use-scroll-spy";

const SECTION_IDS = NAV_SECTIONS.map((section) => section.id);

/**
 * Top-attached "notch" site navigation.
 *
 * The bar hugs the viewport top like the macOS/iPhone notch: flat top edge,
 * rounded bottom corners, and a dark glass surface that never changes with the
 * theme, so it reads as a cutout over whatever hero is behind it. Wordmark and
 * section links live inside; the theme toggle floats outside on the right.
 *
 * The header element spans the full width but passes pointer events through
 * everywhere except the notch itself, so page content stays interactive around
 * it. The notch is left entirely to the small-screen panel below `md`.
 *
 * The only state this component owns is whether the mobile panel is open.
 * Active-section tracking lives in `useScrollSpy`.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { activeId } = useScrollSpy(SECTION_IDS, SCROLL_OFFSET);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  return (
    <>
      <header className="pointer-events-none sticky top-0 z-50 flex justify-center">
        <nav
          aria-label="Primary"
          className="pointer-events-auto flex h-12 w-fit max-w-[calc(100vw-6rem)] items-center gap-2 rounded-b-[20px] border border-t-0 border-white/10 bg-zinc-950/85 px-5 text-zinc-100 shadow-lg shadow-black/10 backdrop-blur-md sm:gap-3"
        >
          <motion.a
            href="#top"
            initial="initial"
            whileHover="hovered"
            className="mr-3 shrink-0 font-mono text-sm tracking-tight text-zinc-100"
          >
            <span className="sr-only">Satyam Raj, back to top</span>
            {/* The leet digits get a lighter weight and muted tone so the
                handle reads as a designed wordmark, not plain text. Kept light
                because the notch surface stays dark in both themes. */}
            <TextRoll
              className="leading-[1.1] py-[0.1em]"
              charClass={(char) =>
                char === "5" || char === "4"
                  ? "font-normal text-zinc-100/60"
                  : "font-semibold text-zinc-100"
              }
            >
              5at4am
            </TextRoll>
          </motion.a>

          <NavSectionLinks variant="notch" activeId={activeId} />

          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="primary-menu"
            className="-mr-1.5 ml-auto flex h-8 w-8 items-center justify-center rounded-md text-zinc-100 transition-colors hover:bg-white/10 focus-visible:bg-white/10 md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </nav>
      </header>

      {/*
        The toggle moves out of the notch: a small floating disc on the top
        right, dressed in the same dark glass and hairline border so it reads
        as part of the notch rather than a separate control. Its bottom edge
        lines up with the notch bar (top-3 + size-9 = y12..48 = notch height).
      */}
      <div className="fixed right-3 top-3 z-50">
        <ThemeToggle
          className="size-9 rounded-full border border-white/10 bg-zinc-950/85 text-zinc-100 shadow-lg shadow-black/10 backdrop-blur-md duration-[350ms] ease-[cubic-bezier(0.33,1,0.68,1)] hover:scale-105 hover:border-white/25 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-100"
          tone="default"
        />
      </div>

      <NavMobilePanel open={open} activeId={activeId} onClose={close} />
    </>
  );
}