"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, BarChart3, Bell, BookOpenCheck, Bot, BriefcaseBusiness, Building2,
  ChartNoAxesCombined, CircleUserRound, ClipboardCheck, Compass, FileSearch, GraduationCap,
  HandHeart, Handshake, LayoutDashboard, Map, MessageCircleQuestion, PhoneCall,
  SearchCheck, ShieldCheck, Sparkles, SquarePen, SquarePlus, UsersRound,
} from "lucide-react";
import { useLanguage } from "./language-provider";
import type { TranslationKey } from "@/lib/i18n";

export type WorkspaceRole = "student" | "recruiter" | "academia" | "parent" | "admin";
export type WorkspaceLink = {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
  group: "career" | "ai" | "network" | "management" | "account";
};

const studentLinks: WorkspaceLink[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, group: "career" },
  { href: "/roadmap", labelKey: "roadmap", icon: Map, group: "career" },
  { href: "/readiness", labelKey: "readiness", icon: ChartNoAxesCombined, group: "career" },
  { href: "/certificates", labelKey: "certificates", icon: Award, group: "career" },
  { href: "/careers", labelKey: "careers", icon: SearchCheck, group: "career" },
  { href: "/mentor", labelKey: "mentor", icon: Bot, group: "ai" },
  { href: "/mock-interview", labelKey: "interview", icon: MessageCircleQuestion, group: "ai" },
  { href: "/resume-analysis", labelKey: "resume", icon: FileSearch, group: "ai" },
  { href: "/resume-builder", labelKey: "resumeBuilder", icon: SquarePen, group: "ai" },
  { href: "/jobs", labelKey: "jobs", icon: BriefcaseBusiness, group: "network" },
  { href: "/scholarships", labelKey: "scholarships", icon: GraduationCap, group: "network" },
  { href: "/community", labelKey: "community", icon: UsersRound, group: "network" },
  { href: "/rewards", labelKey: "rewards", icon: Sparkles, group: "network" },
  { href: "/verification", labelKey: "verification", icon: ShieldCheck, group: "account" },
  { href: "/notifications", labelKey: "notifications", icon: Bell, group: "account" },
  { href: "/profile", labelKey: "profile", icon: CircleUserRound, group: "account" },
  { href: "/parent/access", labelKey: "parent", icon: HandHeart, group: "account" },
];

const primaryStudentLinks = [
  { href: "/dashboard", icon: LayoutDashboard, labels: ["Home", "होम", "होम"], routes: ["/dashboard"] },
  { href: "/recommendations", icon: Compass, labels: ["Career plan", "करियर योजना", "करिअर योजना"], routes: ["/recommendations", "/assessment", "/careers", "/readiness"] },
  { href: "/roadmap", icon: BookOpenCheck, labels: ["Learn", "सीखें", "शिका"], routes: ["/roadmap", "/mentor"] },
  { href: "/mock-interview", icon: MessageCircleQuestion, labels: ["Practice", "अभ्यास", "सराव"], routes: ["/mock-interview", "/resume-analysis", "/resume-builder"] },
  { href: "/jobs", icon: BriefcaseBusiness, labels: ["Opportunities", "अवसर", "संधी"], routes: ["/jobs", "/scholarships", "/applications"] },
  { href: "/profile", icon: CircleUserRound, labels: ["Profile", "प्रोफ़ाइल", "प्रोफाइल"], routes: ["/profile", "/portfolio"] },
];

export function getWorkspaceLinks(role: WorkspaceRole = "student"): WorkspaceLink[] {
  if (role === "academia") return [
    { href: "/academia", labelKey: "academia", icon: Building2, group: "management" },
    { href: "/academia/opportunities", labelKey: "facultyOpportunities", icon: GraduationCap, group: "management" },
    { href: "/academia/collaborations", labelKey: "collaborations", icon: Handshake, group: "management" },
    { href: "/academia/resume-builder", labelKey: "resumeBuilder", icon: SquarePen, group: "management" },
    { href: "/verification", labelKey: "verification", icon: ClipboardCheck, group: "management" },
    { href: "/impact", labelKey: "impact", icon: BarChart3, group: "management" },
    { href: "/notifications", labelKey: "notifications", icon: Bell, group: "account" },
    { href: "/profile", labelKey: "profile", icon: CircleUserRound, group: "account" },
  ];
  if (role === "recruiter") return [
    { href: "/recruiter", labelKey: "industry", icon: Building2, group: "management" },
    { href: "/recruiter/post-job", labelKey: "postOpportunity", icon: SquarePlus, group: "management" },
    { href: "/recruiter/faculty-opportunities", labelKey: "facultyOpportunities", icon: GraduationCap, group: "management" },
    { href: "/recruiter/collaborations", labelKey: "collaborations", icon: Handshake, group: "management" },
    { href: "/recruiter/feedback", labelKey: "employerFeedback", icon: MessageCircleQuestion, group: "management" },
    { href: "/recruiter/upskilling", labelKey: "upskilling", icon: BookOpenCheck, group: "management" },
    { href: "/verification", labelKey: "verification", icon: ClipboardCheck, group: "management" },
    { href: "/impact", labelKey: "impact", icon: BarChart3, group: "management" },
    { href: "/notifications", labelKey: "notifications", icon: Bell, group: "account" },
    { href: "/profile", labelKey: "profile", icon: CircleUserRound, group: "account" },
  ];
  if (role === "admin") return [
    { href: "/admin/moderation", labelKey: "moderation", icon: ShieldCheck, group: "management" },
    { href: "/verification", labelKey: "verification", icon: ClipboardCheck, group: "management" },
    { href: "/impact", labelKey: "impact", icon: BarChart3, group: "management" },
    { href: "/notifications", labelKey: "notifications", icon: Bell, group: "account" },
    { href: "/profile", labelKey: "profile", icon: CircleUserRound, group: "account" },
  ];
  if (role === "parent") return [
    { href: "/parent/access", labelKey: "parent", icon: HandHeart, group: "management" },
    { href: "/parent/dashboard?demo=1", labelKey: "parentCallDemo", icon: PhoneCall, group: "management" },
    { href: "/notifications", labelKey: "notifications", icon: Bell, group: "account" },
    { href: "/profile", labelKey: "profile", icon: CircleUserRound, group: "account" },
  ];
  return studentLinks;
}

const groupLabels = {
  management: "workspaceManagement", career: "careerGroup", ai: "aiGroup",
  network: "networkGroup", account: "accountGroup",
} satisfies Record<WorkspaceLink["group"], TranslationKey>;

export function WorkspaceNavigation({ role = "student" }: { role?: WorkspaceRole }) {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const links = getWorkspaceLinks(role);
  const groups = [...new Set(links.map((link) => link.group))];

  if (role === "student") {
    const localeIndex = locale === "hi" ? 1 : locale === "mr" ? 2 : 0;
    const more = studentLinks.filter((link) => !primaryStudentLinks.some((primary) => primary.href === link.href));
    return <div className="space-y-1">{primaryStudentLinks.map(({ href, icon: Icon, labels, routes }) => {
      const active = routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-accent-soft text-accent" : "text-sidebar-text hover:bg-accent-soft"}`}><Icon className="h-[18px] w-[18px]" aria-hidden />{labels[localeIndex]}</Link>;
    })}<details className="pt-3" open={more.some((link) => pathname === link.href)}><summary className="min-h-11 cursor-pointer rounded-xl px-3 py-3 text-sm font-medium text-sidebar-text">{locale === "hi" ? "और" : locale === "mr" ? "अधिक" : "More"}</summary><div className="mt-1 space-y-1">{more.map((link) => { const Icon = link.icon; const active = pathname === link.href; return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? "bg-accent-soft text-accent" : "text-sidebar-text hover:bg-accent-soft"}`}><Icon className="h-4 w-4" aria-hidden />{t(link.labelKey)}</Link>; })}</div></details></div>;
  }

  return groups.map((group) => (
    <div key={group} className="pb-4">
      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[.14em] text-sidebar-muted">{t(groupLabels[group])}</p>
      <div className="space-y-1">
        {links.filter((link) => link.group === group).map((link) => {
          const linkPath = link.href.split("?")[0];
          const active = pathname === linkPath || (linkPath !== "/dashboard" && pathname.startsWith(`${linkPath}/`));
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}
              className={`group flex items-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${active ? "border-blue-400/20 bg-blue-500/15 text-blue-300" : "border-transparent text-sidebar-text hover:border-blue-400/10 hover:bg-blue-400/10 hover:text-sidebar-strong"}`}>
              <Icon className="mr-3 h-[18px] w-[18px] shrink-0 text-sidebar-muted transition-colors group-hover:text-blue-400" aria-hidden="true" />
              {t(link.labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  ));
}
