import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/site/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/auth/", "/dashboard/", "/design-preview/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
