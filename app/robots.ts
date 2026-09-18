import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Deliberately the same on every environment: previews are kept out of
  // search engines by the X-Robots-Tag header set in proxy.ts, which a
  // crawler can only see if robots.txt lets it fetch the page.
  return { rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api"] } };
}
