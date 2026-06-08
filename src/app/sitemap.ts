import type { MetadataRoute } from "next";
import { guideSitemapRoutes, publicStaticRoutes, roomSitemapRoutes } from "@/lib/site/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [...publicStaticRoutes, ...roomSitemapRoutes, ...guideSitemapRoutes].map((route) => ({
    lastModified,
    ...route,
  }));
}
