import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SimpleThemeToggle } from "@/components/theme/simple-theme-toggle";
// TEMPORARY: the animated toggle is commented out while the flash is isolated.
// import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SITE } from "@/content/site";

/**
 * Slim header for the paper page. It has no section nav, so it is a back-link
 * plus the canonical handle rather than the full `SiteHeader`.
 */
export function PaperHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-sm">
      <nav
        aria-label="Paper"
        className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:px-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          <span className="font-mono">{SITE.handle}</span>
          <span className="sr-only">, back to the resume site</span>
        </Link>
        <p className="ml-auto hidden font-mono text-xs text-muted-foreground sm:block">
          3D paper certificate
        </p>
        {/* Plain cross-fade switch. See the note in site-header. */}
        <SimpleThemeToggle className="shrink-0 sm:-mr-1" />
      </nav>
    </header>
  );
}