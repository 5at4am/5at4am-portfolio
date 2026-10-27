import type { MetadataRoute } from "next";

import { SITE } from "@/content/site";

/* Metadata routes are dynamic by default. `output: "export"` needs them
   evaluated at build time, which is exactly what this route wants anyway. */
export const dynamic = "force-static";

/**
 * Generated rather than committed as a static file, so the sitemap URL always
 * matches `SITE` and the `Host` directive cannot point at another deployment.
 *
 * Everything is crawlable. `_next` is deliberately not disallowed: Google needs
 * the CSS and JavaScript to render the page, and blocking them would degrade
 * what it can index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.domain,
  };
}
