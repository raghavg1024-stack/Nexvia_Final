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
import { WorkspaceNavigation } from "./_components/workspace-navigation";
import { LanguageProvider, LanguageSwitcher } from "./_components/language-provider";
import type { AppLocale } from "@/lib/i18n";
import type { WorkspaceRole } from "./_components/workspace-navigation";
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

async function getSessionContext() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, role: "student" as WorkspaceRole, locale: "en" as AppLocale };
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type, preferred_locale")
      .eq("id", user.id)
      .maybeSingle();
    const validRoles: WorkspaceRole[] = ["student", "recruiter", "academia", "parent", "admin"];
    const role = validRoles.includes(profile?.user_type as WorkspaceRole) ? profile?.user_type as WorkspaceRole : "student";
    const locale = (["en", "hi", "mr"] as const).includes(profile?.preferred_locale as AppLocale)
      ? profile?.preferred_locale as AppLocale
      : "en";
    return { user, role, locale };
  } catch {
    return { user: null, role: "student" as WorkspaceRole, locale: "en" as AppLocale };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, locale } = await getSessionContext();
  const workspaceHome = role === "recruiter"
    ? "/recruiter"
    : role === "academia"
      ? "/academia"
      : role === "parent"
        ? "/parent/access"
        : role === "admin"
          ? "/admin/moderation"
          : "/dashboard";
  const workspaceDescription = role === "student"
    ? "Your learning and career workspace"
    : role === "recruiter"
      ? "Industry hiring and upskilling workspace"
      : role === "academia"
        ? "Institution outcomes and collaboration workspace"
        : role === "parent"
          ? "Family progress and support workspace"
          : "Platform moderation and impact workspace";

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bridge-growth min-h-full flex flex-col bg-background text-foreground">
        <Script id="nexvia-theme-init" strategy="beforeInteractive">
          {`try{const saved=localStorage.getItem("nexvia-theme");const theme=saved==="light"||saved==="dark"?saved:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{document.documentElement.dataset.theme="light"}`}
        </Script>
        <LanguageProvider initialLocale={locale}>
        <ThemeToggle studentWorkspace={!!user && role === "student"} />
        {user && (
          <header className="industry-header sticky top-0 z-40 border-b border-blue-300/15 shadow-[0_10px_35px_rgba(15,23,42,.16)] backdrop-blur-xl">
            <nav className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
              <NexviaLogoMark href={workspaceHome} />
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <LogoutButton />
                <MobileNav role={role} />
              </div>
            </nav>
          </header>
        )}
        {user && (
          <aside className="industry-sidebar fixed inset-y-[4.5rem] left-0 z-30 hidden w-72 border-r border-blue-300/15 shadow-[16px_0_45px_rgba(15,23,42,.16)] xl:flex xl:flex-col" aria-label="Workspace navigation">
            <div className="border-b border-white/[.05] px-5 py-5">
              <p className="text-xs font-semibold text-accent">Workspace</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{workspaceDescription}</p>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Workspace links">
              <WorkspaceNavigation role={role} />
            </nav>
            <div className="border-t border-white/[.05] p-4">
              <p className="px-1 text-[11px] leading-5 text-slate-500">Private workspace · your data stays protected</p>
            </div>
          </aside>
        )}
        <main className={`flex min-w-0 flex-1 flex-col${user ? " xl:pl-72" : ""}${user && role === "student" ? " workspace-shell" : ""}`}>
          <Breadcrumbs />
          {children}
        </main>
        <footer className={`industry-footer border-t border-slate-800 text-white${user ? " xl:pl-72" : ""}${user && role === "student" ? " pb-20 xl:pb-0" : ""}`}>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 sm:px-6">
            <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <NexviaLogoMark href={user ? workspaceHome : "/"} />
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
        </LanguageProvider>
      </body>
    </html>
  );
}
