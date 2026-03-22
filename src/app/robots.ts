import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/status"],
    },
    sitemap: "https://ai-company-portfolio.vercel.app/sitemap.xml",
  };
}
