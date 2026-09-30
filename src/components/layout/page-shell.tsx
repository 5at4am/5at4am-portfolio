import type { ReactNode } from "react";

export type PageShellProps = {
  /** Rendered above `<main>` — the sticky header. */
  header?: ReactNode;
  /** Rendered after `<main>`, so it stays outside the landmarks' content. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Vertical page frame: header, a `<main>` that grows to fill the viewport so
 * the footer is pushed to the bottom on short pages, and the footer.
 *
 * `id="main"` is the target of the skip link in the root layout.
 */
export function PageShell({ header, footer, children }: PageShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      {header}
      <main id="main" className="flex-1">
        {children}
      </main>
      {footer}
    </div>
  );
}
