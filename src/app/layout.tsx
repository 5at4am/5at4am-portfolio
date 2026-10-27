import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/shaders/community.css";
import { JsonLd } from "@/components/seo/json-ld";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { rootMetadata, rootViewport } from "@/content/metadata";
import { siteJsonLd } from "@/content/json-ld";

export const metadata: Metadata = rootMetadata;

/* `themeColor` and `colorScheme` are viewport fields in this Next version, not
   metadata fields. See the note on `rootViewport`. */
export const viewport: Viewport = rootViewport;

/**
 * Site-wide structured data.
 *
 * `Person` and `WebSite` are true on every route, so they live here. The home
 * `ProfilePage` and work-history `ItemList` are rendered by the home page;
 * `/paper` renders its own `WebPage` and `BreadcrumbList`. Publishing a document
 * on a route that does not render the content it describes is the kind of thing
 * that reads as spam to a crawler.
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Root layout. Owns the document shell, fonts, the theme provider, the cold-load
 * preloader, and the skip link that targets `#main` — which every page renders
 * via `<PageShell>`.
 *
 * The preloader lives on the home page only (`src/app/page.tsx`), not here.
 * It is a cold-load introduction to one page, so charging it to every route
 * meant a visitor who opened `/paper` or hit a 404 paid for a greeting that had
 * nothing to do with the page they asked for.
 *
 * `suppressHydrationWarning` is required by `next-themes`: it sets the `dark`
 * class on `<html>` from a blocking script, so the served markup and the first
 * client render intentionally disagree about that one attribute.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-pt-20 antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <JsonLd documents={siteJsonLd()} />
        <ThemeProvider>
          {/*
            `focus:z-[110]`, not `z-[60]`. The preloader's panel is `z-[100]`
            and opaque, so at `z-60` this link was painted *behind* it: a
            keyboard user pressing Tab on a cold load of `/` focused a skip
            link they could not see, and pressing Enter jumped to `#main` under a
            panel that was still covering the page for another five seconds.
            110 clears the preloader and still sits under nothing else that
            matters.
          */}
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-sm focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:outline-2 focus:outline-offset-2 focus:outline-foreground"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
