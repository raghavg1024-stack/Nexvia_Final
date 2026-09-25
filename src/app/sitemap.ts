import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://career-os-mugiwara9.vercel.app";
  return ["", "/about", "/reviews", "/waitlist", "/contact", "/login", "/signup", "/demo"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/signup" ? 0.9 : 0.7,
  }));
}
