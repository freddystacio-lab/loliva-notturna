import type {MetadataRoute} from "next";

const locales = ["es", "en", "it"] as const;
const paths = ["", "menu", "story", "experiences", "gallery", "reserve", "contact", "privacy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const base = new URL(siteUrl);
  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: new URL(path ? `/${locale}/${path}` : `/${locale}`, base).toString(),
      lastModified: new Date(),
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
