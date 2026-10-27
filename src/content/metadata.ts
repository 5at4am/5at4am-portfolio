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

export const HOME_TITLE = `${SITE.name} | ${SITE.role}`;
export const HOME_DESCRIPTION = `${SITE.name}, ${SITE.role}. Builds LLM, RAG, OCR, and multi-agent systems end to end with Python, FastAPI, and LangChain.`;

export const PAPER_TITLE = `3D Paper Certificate | ${SITE.name}`;
export const PAPER_DESCRIPTION = `The Estrel.ai capstone certificate as an interactive translucent 3D paper document, rendered in the browser.`;

const OG_IMAGE = {
  url: `${SITE.url}/og.png`,
  width: 1200,
  height: 630,
  alt: `${SITE.name}, ${SITE.role}`,
  type: "image/png",
};

/** Site-wide defaults, applied once in `app/layout.tsx`. */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  keywords: [
    "Satyam Raj",
    "AI engineer",
    "LLM engineer",
    "RAG",
    "OCR",
    "multi-agent systems",
    "Python",
    "FastAPI",
    "LangChain",
    "Bhopal",
    "portfolio",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  /* Absolute-path references into `public/`. `metadataBase` above resolves them
     to `https://5at4am.me/…` in the exported HTML, so the same literals work in
     dev and in the static build. The manifest was previously absent entirely,
     which also meant no `theme-color`, so mobile browsers painted their own
     chrome around the site.

     `src/app/favicon.ico` is a file convention, so Next emits the favicon link
     itself. Restating `/favicon.ico` here produced a second icon tag for the
     same file. */
  manifest: "/manifest.webmanifest",
  /* Google Search does not list SVG as a supported favicon format. Keep the
     vector as the source for the committed PNGs (`npm run icons:touch`) and
     declare the raster sizes here. `src/app/favicon.ico` is still emitted by
     Next's file convention as the broad browser fallback. */
  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    locale: "en_IN",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
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
  /* Site-level Open Graph fields are restated here. Next merges route metadata
     over the root shallowly, and a nested `openGraph` REPLACES the inherited
     object rather than merging into it — so overriding the title dropped
     `images`, and the route inherited neither `url` nor the other root fields.
     Verified in an earlier export: `og:image` was present on `/`, absent on
     `/paper`; `og:url` was absent on both after the route override. */
  openGraph: {
    type: "website",
    url: `${SITE.url}/paper`,
    siteName: SITE.name,
    title: PAPER_TITLE,
    description: PAPER_DESCRIPTION,
    locale: "en_IN",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: PAPER_TITLE,
    description: PAPER_DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
};
