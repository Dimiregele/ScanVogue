
import type { MetadataRoute } from "next";
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin-x7k2", "/gest-x4p7", "/api/"],
      },
    ],
    sitemap: "https://scanvogue.ro/sitemap.xml",
  };
}
