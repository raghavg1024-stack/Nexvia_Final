"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, BarChart3, Bell, BookOpenCheck, Bot, BriefcaseBusiness, Building2,
  ChartNoAxesCombined, CircleUserRound, ClipboardCheck, FileSearch, GraduationCap,
  HandHeart, LayoutDashboard, Map, MessageCircleQuestion, SearchCheck, ShieldCheck,
  Sparkles, UsersRound,
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

const learnerLinks: WorkspaceLink[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, group: "career" },
  { href: "/roadmap", labelKey: "roadmap", icon: Map, group: "career" },
  { href: "/readiness", labelKey: "readiness", icon: ChartNoAxesCombined, group: "career" },
  { href: "/certificates", labelKey: "certificates", icon: Award, group: "career" },
  { href: "/careers", labelKey: "careers", icon: SearchCheck, group: "career" },
  { href: "/mentor", labelKey: "mentor", icon: Bot, group: "ai" },
  { href: "/mock-interview", labelKey: "interview", icon: MessageCircleQuestion, group: "ai" },
  { href: "/resume-analysis", labelKey: "resume", icon: FileSearch, group: "ai" },
  { href: "/jobs", labelKey: "jobs", icon: BriefcaseBusiness, group: "network" },
  { href: "/scholarships", labelKey: "scholarships", icon: GraduationCap, group: "network" },
  { href: "/community", labelKey: "community", icon: UsersRound, group: "network" },
  { href: "/rewards", labelKey: "rewards", icon: Sparkles, group: "network" },
  { href: "/verification", labelKey: "verification", icon: ShieldCheck, group: "account" },
  { href: "/notifications", labelKey: "notifications", icon: Bell, group: "account" },
  { href: "/profile", labelKey: "profile", icon: CircleUserRound, group: "account" },
  { href: "/parent/access", labelKey: "parent", icon: HandHeart, group: "account" },
];

export function getWorkspaceLinks(role: WorkspaceRole = "student"): WorkspaceLink[] {
  const management: WorkspaceLink[] = [];
  if (role === "academia") management.push(
    { href: "/academia", labelKey: "academia", icon: Building2, group: "management" },
    { href: "/verification", labelKey: "verification", icon: ClipboardCheck, group: "management" },
    { href: "/impact", labelKey: "impact", icon: BarChart3, group: "management" },
  );
  if (role === "recruiter") management.push(
    { href: "/recruiter", labelKey: "industry", icon: Building2, group: "management" },
    { href: "/recruiter/upskilling", labelKey: "upskilling", icon: BookOpenCheck, group: "management" },
    { href: "/verification", labelKey: "verification", icon: ClipboardCheck, group: "management" },
    { href: "/impact", labelKey: "impact", icon: BarChart3, group: "management" },
  );
  if (role === "admin") management.push(
    { href: "/admin/moderation", labelKey: "moderation", icon: ShieldCheck, group: "management" },
    { href: "/verification", labelKey: "verification", icon: ClipboardCheck, group: "management" },
    { href: "/impact", labelKey: "impact", icon: BarChart3, group: "management" },
  );
  if (role === "parent") return [
    { href: "/parent", labelKey: "parent", icon: HandHeart, group: "management" },
    { href: "/notifications", labelKey: "notifications", icon: Bell, group: "account" },
    { href: "/profile", labelKey: "profile", icon: CircleUserRound, group: "account" },
  ];
  const seen = new Set(management.map((link) => link.href));
  return [...management, ...learnerLinks.filter((link) => !seen.has(link.href))];
}

const groupLabels = {
  management: "Workspace management", career: "Career & learning", ai: "AI tools & coaching",
  network: "Opportunities & network", account: "Account",
};

export function WorkspaceNavigation({ role = "student" }: { role?: WorkspaceRole }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const links = getWorkspaceLinks(role);
  const groups = [...new Set(links.map((link) => link.group))];

  return groups.map((group) => (
    <div key={group} className="pb-4">
      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[.14em] text-sidebar-muted">{groupLabels[group]}</p>
      <div className="space-y-1">
        {links.filter((link) => link.group === group).map((link) => {
          const active = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} prefetch={false} aria-current={active ? "page" : undefined}
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
