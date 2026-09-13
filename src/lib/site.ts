/**
 * Central production-domain configuration for all SEO metadata (canonical URLs,
 * OG/Twitter URLs, sitemap, JSON-LD). Override with NEXT_PUBLIC_SITE_URL env
 * (without trailing slash) when the deployment domain differs.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://5at4am.vercel.app";

export const siteName = "Satyam Raj — AI Engineer";

export const ogImage = {
  url: `${siteUrl}/og-image.png`,
  width: 1200,
  height: 630,
  alt: "5at4am — Satyam Raj, AI Engineer",
};