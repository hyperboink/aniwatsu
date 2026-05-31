import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/anime/", "/browse", "/search"],
        disallow: ["/api/", "/watch/"],
      },
    ],
    sitemap: "https://aniwatsu.com/sitemap.xml",
  };
}
