import type { Metadata } from "next";
export const metadata: Metadata = { title: "Log In", description: "Log in securely to your Nexvia career workspace.", robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
