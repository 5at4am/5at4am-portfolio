import { SITE } from "@/content/site";

/**
 * Site footer. Identical on every page, so it is a single component rather
 * than a repeated block.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
        Built by {SITE.name}. {SITE.domain}
      </div>
    </footer>
  );
}
