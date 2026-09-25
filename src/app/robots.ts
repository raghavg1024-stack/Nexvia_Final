import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://career-os-mugiwara9.vercel.app";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/profile", "/roadmap", "/mentor", "/mock-interview", "/resume-analysis", "/parent", "/recruiter", "/academia", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
