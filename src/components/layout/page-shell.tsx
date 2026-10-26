import type { ReactNode } from "react";

import { CurtainScroll } from "./curtain-scroll";

export type PageShellProps = {
  /** Rendered above `<main>` — the sticky header. */
  header?: ReactNode;
  /** Rendered after `<main>`, so it stays outside the landmarks' content. */
  footer?: ReactNode;
  /**
   * Page-level floating controls that must escape `<main>`.
   *
   * Not a convenience. The curtain puts a transform on `<main>`, and a
   * transformed element becomes the containing block for any `position:
   * fixed` descendant — so a `fixed` overlay mounted inside `<main>` stops
   * being viewport-relative and scrolls away with the page. The contact
   * ball is exactly that, and it was silently broken by this until it moved
   * out here.
   */
  overlay?: ReactNode;
  children: ReactNode;
};

/**
 * Vertical page frame: header, a `<main>` that grows to fill the viewport so
 * the footer is pushed to the bottom on short pages, and the footer.
 *
 * `id="main"` is the target of the skip link in the root layout.
 *
 * ── THE CURTAIN ────────────────────────────────────────────────
 * The footer is not at the end of the document. It is a fixed layer at
 * `z-0`, and `<main>` is opaque at `z-10` above it, so the footer is
 * invisible for the entire scroll and is uncovered only at the very end,
 * when the page slides up off the top of the screen. `curtain-runway` is the
 * extra viewport of scroll that makes that translation possible.
 *
 * The DOM is identical with and without reduced motion; the CSS in
 * `globals.css` drops the runway and un-fixes the footer. So the reduced
 * path is a plain end-of-page footer rather than a broken performance, with
 * no second render tree and no hydration to get wrong.
 */
export function PageShell({ header, footer, overlay, children }: PageShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      {header}
      {/* The sliding page. `bg-background` is load-bearing, not decorative:
          without an opaque backdrop here the fixed footer shows through the
          entire document. `relative` + `z-10` puts it above `curtain-footer`. */}
      {/*
        `tabIndex={-1}` on `<main>`. Without it the skip link only moves the
        *sequential focus navigation starting point*, not DOM focus, so the next
        Tab continued from wherever it was — and the first focusable descendant
        is the Experience timeline's first stop, which meant About was skipped
        entirely. `outline-none` because a programmatic focus target should not
        draw a ring: the user arrived here deliberately, by activating the skip
        link, and there is no pointer position to point at.
      */}
      <main
        id="main"
        tabIndex={-1}
        data-curtain-page
        className="relative z-10 flex-1 bg-background outline-none"
      >
        {children}
      </main>
      {/* Scroll distance, not content. */}
      <div data-curtain-runway className="curtain-runway" aria-hidden="true" />
      {/*
        The footer starts `inert`, and `CurtainScroll` lifts it as the curtain
        finishes uncovering it.

        The curtain leaves this footer occluded behind an opaque `<main>` for the
        whole document and reveals it only at the very end, but `inert` was
        never applied, so all thirteen of its links stayed in the tab order
        while invisible. Measured at `scrollY 0` with `elementFromPoint`: 13 of
        13 hit-tested against `<main>` rather than themselves, and because the
        container is `position: fixed` the browser cannot scroll a focused
        descendant into view — so tabbing produced no visible movement at all
        (WCAG 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured). Enter still fired
        them.

        `inert` rather than `aria-hidden`: it removes the subtree from the tab
        order and the accessibility tree in one attribute, and it is the only one
        of the two that also stops activation. It is set here on the server so
        the hidden state is correct before any JavaScript runs, and the client
        removes it once the footer is actually uncovered — which never happens
        under reduced motion, where the CSS makes this a plain end-of-page
        footer, so there the attribute stays off the element entirely (the
        reduced-motion branch renders the footer `static` and does not toggle).
      */}
      <div
        data-curtain-footer
        className="curtain-footer"
        inert
      >
        {footer}
      </div>
      {overlay}
      <CurtainScroll />
    </div>
  );
}