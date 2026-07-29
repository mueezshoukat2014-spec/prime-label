import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/*?verify=",
        ],
      },
    ],
    sitemap: "https://primelabelsintl.com/sitemap.xml",
    host: "https://primelabelsintl.com",
  };
}
