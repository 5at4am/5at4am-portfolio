import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { profile } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const projectPages = profile.projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...projectPages,
  ];
}