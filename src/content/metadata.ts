import type { Metadata, Viewport } from "next";

import { SITE } from "./site";

/**
 * Route metadata. Lives with the content rather than inline in the page files,
 * so titles, descriptions, and the canonical host are defined once and pages
 * stay pure composition.
 *
 * `rootMetadata` is applied by `app/layout.tsx` and is inherited by every
 * route. Page-level objects only override what differs.
 */

const HOME_TITLE = `${SITE.name} | ${SITE.role}`;
const HOME_DESCRIPTION = `${SITE.name}, ${SITE.role}. Builds LLM, RAG, OCR, and multi-agent systems end to end with Python, FastAPI, and LangChain.`;

const PAPER_TITLE = `3D Paper Certificate | ${SITE.name}`;
const PAPER_DESCRIPTION = `The ${SITE.role} certificate as an interactive translucent 3D paper document, rendered in the browser.`;

const OG_IMAGE = {
  url: `${SITE.url}/og.png`,
  width: 1200,
  height: 630,
};

/** Site-wide defaults, applied once in `app/layout.tsx`. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  authors: [{ name: SITE.name, url: SITE.url }],
  /* Absolute-path references into `public/`. `metadataBase` above resolves them
     to `https://5at4am.me/…` in the exported HTML, so the same literals work in
     dev and in the static build. The manifest was previously absent entirely,
     which also meant no `theme-color`, so mobile browsers painted their own
     chrome around the site. */
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

/** Home page inherits the root title/description; only the canonical differs. */
export const homeMetadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Viewport, exported separately from `metadata`.
 *
 * `themeColor` and `colorScheme` live on the `viewport` export in this Next
 * version, not on `metadata` — putting them on `metadata` compiles without
 * complaint and silently emits nothing. Verified: `theme-color` was absent from
 * the built HTML until this moved. That is the one failure mode worth writing
 * down, because there is no error to notice.
 *
 * `#09090b` is `--vng-foreground`, the colour the notch header sits on, so the
 * mobile URL bar reads as part of the site rather than as a separate app.
 * `colorScheme: "light dark"` tells the browser both palettes are supported so
 * it can pick form-control and caret colours per theme, matching the
 * `color-scheme: light` already set on `:root` in `globals.css`.
 */
export const rootViewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "light dark",
};

export const paperMetadata: Metadata = {
  title: PAPER_TITLE,
  description: PAPER_DESCRIPTION,
  alternates: { canonical: "/paper" },
  /* `images` restated on both objects. Next merges route metadata over the root
     shallowly, and a nested `openGraph` REPLACES the inherited object rather
     than merging into it — so overriding the title dropped `images` entirely.
     Verified in the export before this fix: `og:image` present on `/`, absent
     on `/paper`. */
  openGraph: {
    title: PAPER_TITLE,
    description: PAPER_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAPER_TITLE,
    description: PAPER_DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};
