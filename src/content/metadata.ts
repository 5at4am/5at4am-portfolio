import type { Metadata } from "next";

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

const PROFILE_TITLE = `${SITE.name} (@${SITE.handle}) | ${SITE.role}`;
const PROFILE_DESCRIPTION = `GitHub-style profile for ${SITE.name}. ${SITE.role} building LLM, RAG, OCR, and multi-agent systems with Python, FastAPI, and LangChain.`;

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

export const profileMetadata: Metadata = {
  title: PROFILE_TITLE,
  description: PROFILE_DESCRIPTION,
  alternates: { canonical: "/profile" },
  openGraph: {
    title: PROFILE_TITLE,
    description: PROFILE_DESCRIPTION,
  },
  twitter: {
    title: PROFILE_TITLE,
    description: PROFILE_DESCRIPTION,
  },
};

export const paperMetadata: Metadata = {
  title: PAPER_TITLE,
  description: PAPER_DESCRIPTION,
  alternates: { canonical: "/paper" },
  openGraph: {
    title: PAPER_TITLE,
    description: PAPER_DESCRIPTION,
  },
  twitter: {
    title: PAPER_TITLE,
    description: PAPER_DESCRIPTION,
  },
};
