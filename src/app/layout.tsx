import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./_components/logout-button";
import { NexviaLogoMark } from "./_components/nexvia-logo";
import { MobileNav } from "./_components/mobile-nav";
import { Breadcrumbs } from "./_components/breadcrumbs";
import { CookieConsent } from "./_components/cookie-consent";
import { SiteAnalytics } from "./_components/site-analytics";
import { ThemeToggle } from "./_components/theme-toggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://career-os-mugiwara9.vercel.app"),
  title: {
    default: "Nexvia — Academia–Industry Collaboration Portal",
    template: "%s | Nexvia",
  },
  description:
    "Nexvia connects students, academic institutions, and industry partners through skill mapping, internships, and placement readiness.",
  keywords: [
    "academia industry collaboration",
    "skill mapping",
    "internships",
    "placement readiness",
    "career planning",
    "AI mentor",
    "learning roadmap",
    "career assessment",
    "skills development",
  ],
  openGraph: {
    title: "Nexvia — Academia–Industry Collaboration Portal",
    description:
      "Map skills, close industry gaps, and connect learners to internships and placements.",
    type: "website",
    siteName: "Nexvia",
    url: "/",
  },
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/favicon.svg" },
  robots: { index: true, follow: true },
};

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "My Roadmap" },
  { href: "/jobs", label: "Jobs" },
  { href: "/scholarships", label: "Internships & Scholarships" },
  { href: "/recruiter", label: "Industry" },
  { href: "/academia", label: "Academia" },
  { href: "/mentor", label: "AI Mentor" },
  { href: "/mock-interview", label: "Mock Interview" },
  { href: "/resume-analysis", label: "Resume Analysis" },
  { href: "/community", label: "Community" },
  { href: "/certificates", label: "Certificates" },
  { href: "/readiness", label: "Career Readiness" },
  { href: "/rewards", label: "Rewards" },
  { href: "/careers", label: "Careers" },
  { href: "/profile", label: "Profile" },
  { href: "/parent/access", label: "Parent Portal" },
];

async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bridge-growth min-h-full flex flex-col bg-background text-foreground">
        <Script id="nexvia-theme-init" strategy="beforeInteractive">
          {`try{const saved=localStorage.getItem("nexvia-theme");const theme=saved==="light"||saved==="dark"?saved:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{document.documentElement.dataset.theme="light"}`}
        </Script>
        <ThemeToggle />
        {user && (
          <header className="industry-header sticky top-0 z-40 border-b border-blue-300/15 shadow-[0_10px_35px_rgba(15,23,42,.16)] backdrop-blur-xl">
            <nav className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
              <NexviaLogoMark href="/dashboard" />
              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-300 lg:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7]" /> Quest mode
                </span>
                <LogoutButton />
                <MobileNav />
              </div>
            </nav>
          </header>
        )}
        {user && (
          <aside className="industry-sidebar fixed inset-y-[4.5rem] right-0 z-30 hidden w-64 border-l border-blue-300/15 shadow-[-16px_0_45px_rgba(15,23,42,.16)] xl:flex xl:flex-col" aria-label="Workspace navigation">
            <div className="border-b border-white/[.05] px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">Workspace</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Your career collaboration hub</p>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Workspace links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  <span className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-700 transition-colors group-hover:bg-cyan-300" aria-hidden="true" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/[.05] p-4">
              <p className="px-1 text-[11px] leading-5 text-slate-500">Private workspace · your data stays protected</p>
            </div>
          </aside>
        )}
        <main className={`flex min-w-0 flex-1 flex-col${user ? " xl:pr-64" : ""}`}>
          <Breadcrumbs />
          {children}
        </main>
        <footer className={`industry-footer border-t border-slate-800 text-white${user ? " xl:pr-64" : ""}`}>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 sm:px-6">
            <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <NexviaLogoMark href={user ? "/dashboard" : "/"} />
            </div>
            <p className="text-center text-xs text-slate-500 sm:text-right">
              &copy; {new Date().getFullYear()} Nexvia. Discover Yourself. Learn
              Smarter. Build Your Future.
            </p>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <Link href="/about" className="hover:text-emerald-300">About</Link><Link href="/reviews" className="hover:text-emerald-300">Reviews</Link><Link href="/waitlist" className="hover:text-emerald-300">Waitlist</Link><Link href="/contact" className="hover:text-emerald-300">Contact</Link><Link href="/#faq" className="hover:text-emerald-300">FAQ</Link>
            </nav>
          </div>
        </footer>
        <CookieConsent />
        <SiteAnalytics />
      </body>
    </html>
  );
}
