import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/shaders/community.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { WordsPreloader } from "@/components/ui/words-preloader";
import { rootMetadata } from "@/content/metadata";

export const metadata: Metadata = rootMetadata;

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
 * The preloader lives here rather than in a page because the App Router keeps
 * this layout mounted across client-side navigations: `/` to `/profile` swaps
 * the page subtree and leaves the preloader alone, so the intro never replays
 * on a route change.
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
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm"
          >
            Skip to content
          </a>
          {children}
          <WordsPreloader />
        </ThemeProvider>
      </body>
    </html>
  );
}
