import { siteConfig } from "../config/site";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`
  };
}