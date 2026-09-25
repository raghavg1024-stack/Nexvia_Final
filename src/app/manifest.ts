import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexvia Career OS",
    short_name: "Nexvia",
    description: "AI-assisted career assessment, roadmaps, readiness, and opportunity matching.",
    start_url: "/",
    display: "standalone",
    background_color: "#070a12",
    theme_color: "#7c3aed",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
