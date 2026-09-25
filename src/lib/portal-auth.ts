export const PORTALS = {
  student: {
    label: "Student",
    eyebrow: "Learn · Build · Grow",
    description: "Assessment, career roadmap, mentor, interviews and opportunities.",
    accountType: "student",
    destination: "/dashboard",
    signupDestination: "/assessment",
    accent: "from-violet-500 to-cyan-400",
  },
  industry: {
    label: "Industry",
    eyebrow: "Hire verified talent",
    description: "Post opportunities and discover students matched by skills and eligibility.",
    accountType: "recruiter",
    destination: "/recruiter",
    signupDestination: "/recruiter/setup",
    accent: "from-cyan-500 to-blue-500",
  },
  academia: {
    label: "Academia",
    eyebrow: "Improve learner outcomes",
    description: "Track cohort skill gaps, readiness and placement pathways.",
    accountType: "academia",
    destination: "/academia",
    signupDestination: "/academia",
    accent: "from-amber-400 to-rose-500",
  },
  parent: {
    label: "Parent",
    eyebrow: "Support your learner",
    description: "View a linked ward's progress, readiness and overdue learning tasks.",
    accountType: "parent",
    destination: "/parent/access",
    signupDestination: "/parent/access",
    accent: "from-emerald-400 to-cyan-500",
  },
} as const;

export type PortalKey = keyof typeof PORTALS;

export function isPortalKey(value: string): value is PortalKey {
  return Object.prototype.hasOwnProperty.call(PORTALS, value);
}
