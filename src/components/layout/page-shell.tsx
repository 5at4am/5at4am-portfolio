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
      <main id="main" data-curtain-page className="relative z-10 flex-1 bg-background">
        {children}
      </main>
      {/* Scroll distance, not content. */}
      <div data-curtain-runway className="curtain-runway" aria-hidden="true" />
      <div data-curtain-footer className="curtain-footer">
        {footer}
      </div>
      {overlay}
      <CurtainScroll />
    </div>
  );
}