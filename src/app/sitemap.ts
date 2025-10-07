import { siteConfig } from "../config/site";
import { getAllProductSlugs } from "../lib/products";

export default async function sitemap() {
  const base = siteConfig.baseUrl;
  const staticPages = ["", "about", "shop", "contact"].map(p => ({
    url: `${base}/${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7
  }));
  const slugs = await getAllProductSlugs();
  const products = slugs.map(slug => ({
    url: `${base}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8
  }));
  return [...staticPages, ...products];
}