import type { Metadata } from "next";
export const metadata: Metadata = { title: "Interactive product demo", description: "Explore a sample student journey from profile to opportunity, with explained recommendations and practical next steps.", alternates: { canonical: "/demo" } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
