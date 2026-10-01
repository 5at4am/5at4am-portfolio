"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, type MouseEvent, type RefObject } from "react";

import { NavIconLinks } from "./nav-icon-links";
import { NavSectionLinks } from "./nav-section-links";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useFocusContainment } from "@/hooks/use-focus-containment";

export type NavMobilePanelProps = {
  open: boolean;
  activeId: string;
  onClose: () => void;
  /**
   * The control that opened the panel, so focus can go back to it on close.
   * See `useFocusContainment` for why this is passed rather than detected.
   */
  returnFocusTo?: RefObject<HTMLElement | null>;
};

/**
 * The small-screen navigation: a sheet that covers the viewport from the top
 * down, with the notch floating on top of it.
 *
 * ── WHY A SHEET AND NOT A DROPDOWN ──────────────────────────
 * It used to be an ordinary in-flow block placed after the sticky header, which
 * broke in two ways that only show up once you have scrolled:
 *
 *   It was positioned by document flow, not by the viewport. The header is
 *   `sticky`, so it stayed pinned while the panel scrolled away with the
 *   content. At scrollY 2200 the panel's top edge was at y=-2119 — off the top
 *   of the screen — and `useBodyScrollLock` had already stopped the page from
 *   scrolling, so there was no way to reach it. The menu simply did not appear.
 *
 *   It stopped short of the fold, so on a short viewport the bottom of it was
 *   unreachable. Landscape iPhone is 390px tall; the panel is 315px and starts
 *   under a 48px bar, so 21px of it — the icon rail — sat below the fold with
 *   no way to scroll to it.
 *
 * `fixed inset-0` fixes both at once, and a full-height sheet buys three more
 * things that a dropdown cannot:
 *
 *   Tapping the empty part of the sheet closes the menu, because the sheet IS
 *   the backdrop. No second element, and the whole area below the links is a
 *   target.
 *
 *   It covers the contact ball. The ball is a fixed overlay, so a dropdown that
 *   only occupies the top of the screen leaves the ball sitting on top of the
 *   open menu; the ball's z-index is now below the sheet's for the same reason.
 *
 *   The notch no longer needs a seam. The sheet starts at y=0 and the notch
 *   floats on it, so there is no hairline border running edge to edge under a
 *   centred capsule, which is what made the two read as unrelated pieces.
 *
 * ── FOCUS ───────────────────────────────────────────────────
 * It is a dialog, not a disclosure: it covers the page and takes focus. So it
 * says so with `role`/`aria-modal`, moves focus to the first link on open,
 * holds Tab inside itself, and hands focus back to the hamburger on close.
 * See `useFocusContainment`.
 *
 * It is `md:hidden`, and `SiteHeader` closes it when the viewport crosses that
 * breakpoint — otherwise rotating to landscape desktop width hid the sheet
 * while `open` stayed true, leaving the body scroll-locked with nothing on
 * screen to unlock it.
 */
export function NavMobilePanel({ open, activeId, onClose, returnFocusTo }: NavMobilePanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(open);
  useEscapeKey(open, onClose);
  useFocusContainment(panelRef, open, returnFocusTo);

  const motionProps = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
      };

  /* ── tapping the sheet dismisses it ────────────────────────
     The sheet covers the viewport, so the empty part of it IS the
     backdrop and a menu that only closes via its toggle is a menu
     you have to aim at twice. The X in the notch remains the
     labelled, obvious way out; this is the forgiving one.

     `click`, and NOT `pointerdown`, which is the obvious choice and
     is wrong here. Closing on pointerdown starts the unmount before
     the browser has dispatched the `click` it synthesises on
     touchend, so the click resolves against the page that is now
     underneath and goes through to whatever is there — measured: a
     tap on the sheet's empty middle jumped the page to `#contact`.
     A ghost click through your own dismiss gesture.

     Handling `click` means the sheet is still mounted when the
     event is dispatched, so the target is the sheet's own
     background and nothing leaks past it.

     The guard is still needed: the event bubbles up from the links
     as well, and without it, tapping a link would close the sheet
     and then navigate — which reads as the tap landing in the wrong
     place. Anything focusable is left to handle itself. */
  const onSheetClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest("a, button, input, select, textarea")) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panelRef}
          id="primary-menu"
          key="menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          {...motionProps}
          onClick={onSheetClick}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          /* `dvh`, not `vh`: on a mobile browser the URL bar collapses as you
             scroll, and `vh` is the height with the bar HIDDEN, so a `vh` sheet
             is taller than the screen and its own bottom edge is unreachable.
             `dvh` tracks the bar. Capped with `overflow-y` as a backstop for
             landscape, where even `dvh` leaves less room than six rows of links
             plus the icon rail need. */
          className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-background pt-12 md:hidden"
        >
          <nav
            aria-label="Primary"
            className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {/* Two columns once there is width for them. Six stacked rows are
                264px before the icon rail, which does not clear a landscape
                phone; side by side it is three rows. */}
            <NavSectionLinks
              variant="bordered"
              activeId={activeId}
              onNavigate={onClose}
              className="sm:grid sm:grid-cols-2 sm:gap-x-6"
            />

            {/* `mt-auto` pins the icon rail to the bottom of the sheet on a tall
                screen instead of leaving it stranded under the links, and
                collapses to sitting directly beneath them when the sheet is
                short and has to scroll. */}
            <div className="mt-auto border-t border-border pt-4">
              <NavIconLinks onNavigate={onClose} />
            </div>
          </nav>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
