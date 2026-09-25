import type { Metadata } from "next";
export const metadata: Metadata = { title: "Judge Demo", description: "Explore the Nexvia hackathon demonstration journey.", alternates: { canonical: "/demo" } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
