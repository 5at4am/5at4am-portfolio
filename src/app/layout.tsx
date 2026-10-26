import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/shaders/community.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { rootMetadata, rootViewport } from "@/content/metadata";
import { allJsonLd, serializeJsonLd } from "@/content/json-ld";

export const metadata: Metadata = rootMetadata;

/* `themeColor` and `colorScheme` are viewport fields in this Next version, not
   metadata fields. See the note on `rootViewport`. */
export const viewport: Viewport = rootViewport;

/**
 * Structured data, rendered as static `<script type="application/ld+json">`
 * tags in the document body.
 *
 * There was no JSON-LD anywhere in the project before this. Everything it
 * asserts is already stated in the visible content — the identity comes from
 * `SITE`, the history from `EXPERIENCE`, the credentials from `AWARDS`, the
 * school from `EDUCATION` — so none of it is a new claim, only the same claims
 * in a form a machine can read. Deriving them from the content modules rather
 * than hand-writing them is the whole point: a second hand-maintained copy of
 * the job history would drift from the rendered page within one edit.
 *
 * `Person`, `WebSite` and `ProfilePage` go on every route. The work-history
 * `ItemList` only goes on the home page, which is the page that renders it —
 * publishing a document on `/paper` that describes content not on `/paper` is
 * the kind of thing that reads as spam to a crawler.
 *
 * `suppressHydrationWarning` on the `<script>` because its content includes
 * today's date, which is a different string on the server than on a client that
 * renders past midnight. The content is machine-read only, so a mismatch in the
 * text cannot affect a human.
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
        {/*
          One tag PER DOCUMENT, not one tag holding them all.

          The first version joined the documents with a newline into a single
          script tag, which produces a file whose content is `{...}\n{...}` —
          not valid JSON, and a crawler parses it as a single malformed block and
          discards the lot. Verified in the export: a single block that failed
          `JSON.parse` at the second document's opening brace. Each document is
          independently valid JSON on its own, which is what the format requires.
        */}
        {allJsonLd().map((document, index) => (
          <script
            key={index}
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(document) }}
          />
        ))}
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
