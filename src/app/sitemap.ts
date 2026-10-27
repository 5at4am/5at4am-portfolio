import type { MetadataRoute } from "next";

import { SITE } from "@/content/site";

/* Metadata routes are dynamic by default. `output: "export"` needs them
   evaluated at build time, which is exactly what this route wants anyway. */
export const dynamic = "force-static";

/**
 * Generated rather than committed as a static file.
 *
 * The previous `public/sitemap.xml` hard-coded the host and had no `lastmod`, so
 * it could drift from `SITE` and gave crawlers no freshness signal. This emits
 * from the same constants the pages use and covers only routes that actually
 * exist: the home page and `/paper`. The removed `/profile` route is gone.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${SITE.updated}T00:00:00.000Z`);

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/paper`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];
}
