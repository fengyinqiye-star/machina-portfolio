import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/status", "/admin", "/dashboard", "/thanks", "/r/"],
    },
    sitemap: "https://ai-company.dev/sitemap.xml",
  };
}
