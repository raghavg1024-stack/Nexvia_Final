"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type WorkspaceLink = { href: string; label: string };

const learnerLinks: WorkspaceLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "My Roadmap" },
  { href: "/jobs", label: "Jobs" },
  { href: "/scholarships", label: "Internships & Scholarships" },
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

export function getWorkspaceLinks(pathname: string): WorkspaceLink[] {
  if (pathname.startsWith("/academia")) {
    return [{ href: "/academia", label: "Academia Dashboard" }, ...learnerLinks];
  }
  if (pathname.startsWith("/recruiter")) {
    return [{ href: "/recruiter", label: "Industry Dashboard" }, ...learnerLinks];
  }
  return learnerLinks;
}

export function WorkspaceNavigation() {
  const pathname = usePathname();

  return getWorkspaceLinks(pathname).map((link) => (
    <Link
      key={link.href}
      href={link.href}
      prefetch={false}
      className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
    >
      <span className="mr-3 h-1.5 w-1.5 rounded-full bg-slate-700 transition-colors group-hover:bg-cyan-300" aria-hidden="true" />
      {link.label}
    </Link>
  ));
}
