"use client";

import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { NavMobilePanel } from "./nav-mobile-panel";
import { NavSectionLinks } from "./nav-section-links";
import { TextRoll } from "@/components/ui/text-roll/text-roll";
import { SimpleThemeToggle } from "@/components/theme/simple-theme-toggle";
// TEMPORARY: the animated toggle is commented out in the markup while the flash
// is isolated with `SimpleThemeToggle`. Restore this import with the toggle.
// import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NAV_SECTIONS, SCROLL_OFFSET } from "@/content/navigation";
import { useScrollSpy } from "@/hooks/use-scroll-spy";

const SECTION_IDS = NAV_SECTIONS.map((section) => section.id);

export type SiteHeaderProps = {
  /**
   * Prefix for the section links, and the href the wordmark returns to.
   *
   * `""` on the home page, where `#about` resolves against a section that is
   * actually on the page. `"/"` on a route that reuses this header but has no
   * sections of its own — the 404 is the only one. Verified in the built HTML
   * before this prop existed: `/_not-found` shipped `#about #experience #projects
   * #skills #achievements #contact #top` and the only ids in the document were
   * `_R_` and `main`, so all seven announced as links and did nothing. With the
   * prefix they become `/#about` and so on, which lands on the real section.
   */
  homePrefix?: string;
};

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
export function SiteHeader({ homePrefix = "" }: SiteHeaderProps = {}) {
  const [open, setOpen] = useState(false);
  const { activeId } = useScrollSpy(SECTION_IDS, SCROLL_OFFSET);
  /* The mobile panel takes focus on open, so it needs somewhere to give it
     back to. A ref rather than a lookup: a tap does not focus the button it
     taps on touch browsers, so the panel cannot discover this for itself. */
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  /* ── leaving small-screen width closes the menu ──────────────
     The panel is `md:hidden`. Rotating a tablet to landscape, or
     resizing a desktop window past 768px, hides it by CSS while
     `open` is still true — so the sheet vanishes but the body
     stays scroll-locked, with nothing on screen to release it. The
     page is then stuck and the only way out is a reload.

     A `matchMedia` listener rather than a resize handler because the
     query flips at the same breakpoint the CSS uses, so the two
     cannot disagree about which side of it we are on. */
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header className="pointer-events-none sticky top-0 z-50 flex justify-center">
        <nav
          /* "Primary" for the notch, "Primary, secondary" for the sheet, so the
             two never collide in a landmark list. While the panel is open there
             were two landmarks both named "Primary" on the same route — the
             notch's nav is always in the DOM and the panel's mounts alongside it.
             Measured off the accessibility tree. The panel's own dialog role and
             `aria-modal` already distinguish it; this just stops the duplication
             reaching the landmark menu at all. */
          aria-label="Primary"
          className="pointer-events-auto flex h-12 w-fit max-w-[calc(100vw-6rem)] items-center gap-2 rounded-b-[20px] border border-t-0 border-white/10 bg-zinc-950/85 px-5 text-zinc-100 shadow-lg shadow-black/10 backdrop-blur-md sm:gap-3"
        >
          <motion.a
            href={`${homePrefix}#top`}
            initial="initial"
            whileHover="hovered"
            /* The wordmark is a control with the same roll as the section
               links, so it has to answer the keyboard too. Without this it was
               the one item in the bar that only reacted to a pointer. */
            whileFocus="hovered"
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

          <NavSectionLinks variant="notch" activeId={activeId} homePrefix={homePrefix} />

          <button
            ref={toggleRef}
            type="button"
            onClick={toggle}
            aria-expanded={open}
            /*
             * `aria-controls` only while the panel is open.
             *
             * `nav-mobile-panel.tsx` places `id="primary-menu"` inside its
             * `{open ? … : null}` branch, so while closed the reference dangled
             * at an element that did not exist. `aria-controls` on a button
             * implies the controlled region is present and can be inspected; a
             * dangling id is worse than none, because a screen reader may
             * announce "collapsed" and offer to jump to something absent.
             *
             * Dropping it while closed is what `aria-expanded` already conveys,
             * and it satisfies the same pairing without the false promise.
             */
            aria-controls={open ? "primary-menu" : undefined}
            /* `size-11` is the 44px minimum touch target. It fits the 48px
               notch with 2px to spare either side, and `-mr-1.5` optically
               centres the glyph against the notch's `px-5` padding rather than
               its box. */
            className="-mr-1.5 ml-auto flex size-11 items-center justify-center rounded-md text-zinc-100 transition-colors hover:bg-white/10 focus-visible:bg-white/10 md:hidden"
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

        The face is a plain shadcn sun/moon, and the switch is a plain
        `setTheme` cross-fade: no `wipe` prop, so no view transition and no
        frozen snapshot. The 200ms colour transition in `globals.css` does the
        work. The circle-blur wipe is still available by passing
        `wipe={DEFAULT_WIPE}`, and is exercised on /theme-lab.

        The animated `Around` face is retained but unused. Restore it, and its
        import, if you want the morphing sun/moon back.

        <ThemeToggle
          className="size-9 rounded-full border border-white/10 bg-zinc-950/85 text-zinc-100 shadow-lg shadow-black/10 backdrop-blur-md duration-[350ms] ease-[cubic-bezier(0.33,1,0.68,1)] hover:scale-105 hover:border-white/25 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-100"
          tone="default"
        />
      */}
      {/*
        The toggle is a sibling of `<header>`, not a child of it, because the
        header is `pointer-events-none` with the notch opting back in — nesting it
        would put the control inside an element that is not part of the `banner`
        landmark for AT purposes while looking like part of the bar. It sits
        outside so it never inherits that `pointer-events` arrangement.
      */}
      <div className="fixed right-3 top-3 z-50">
        <SimpleThemeToggle className="border-white/10 bg-zinc-950/85 text-zinc-100" />
      </div>

      <NavMobilePanel
        open={open}
        activeId={activeId}
        onClose={close}
        returnFocusTo={toggleRef}
        homePrefix={homePrefix}
      />
    </>
  );
}