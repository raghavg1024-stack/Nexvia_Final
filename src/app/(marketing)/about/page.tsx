import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Bell, ChartNoAxesCombined, Languages, LockKeyhole, Network, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About ArticXcoders and Nexvia",
  description: "Meet ArticXcoders and learn how Nexvia connects student skills, academic guidance, and industry opportunity.",
  alternates: { canonical: "/about" },
};

const roles = [
  ["G Raghav Kumar", "Product lead and career workflow", "Product direction, the connected student journey, and presentation."],
  ["UI/UX designer", "Research and experience design", "User flows, accessibility, and the visual system across four portals."],
  ["Frontend developer", "Responsive product interface", "The student workspace, roadmap interactions, and cross-device experiences."],
  ["Backend engineer", "Data and access", "Authentication, role access, and protected student information."],
  ["AI engineer", "Recommendations and coaching", "Career matching, explained recommendations, and interview feedback."],
  ["Quality engineer", "Testing and deployment", "Edge cases, performance, deployments, and demo reliability."],
];
const delivery = [
  { icon: ShieldCheck, title: "Evidence verification", status: "Available", text: "Students submit project, skill, and certificate evidence for institution or recruiter review." },
  { icon: Bell, title: "Notifications", status: "Available", text: "In-app and email alerts cover matches, applications, training, verification, and deadlines." },
  { icon: ChartNoAxesCombined, title: "Impact analytics", status: "Available", text: "Track placements, roadmap completion, readiness improvement, and verified opportunities." },
  { icon: Languages, title: "Multilingual access", status: "Core navigation available", text: "English, Hindi, and Marathi preferences translate workspace navigation. Full content translation remains a next step." },
  { icon: Network, title: "Employer upskilling", status: "Available", text: "Employee cohorts, team skill-gap reports, readiness tracking, and training assignments." },
  { icon: LockKeyhole, title: "Admin moderation", status: "Available", text: "Approval queues for institutions, employers, opportunities, research posts, and submitted evidence." },
];

export default function AboutPage() {
  return <div className="premium-page"><div className="premium-section py-16"><p className="premium-eyebrow">About Nexvia</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">A clearer route from learning to opportunity</h1><p className="premium-muted mt-6 max-w-3xl text-lg leading-8">Students often receive disconnected advice, generic courses, and unrelated job listings. Nexvia brings assessment, career selection, learning plans, mentorship, practice, and relevant opportunities into one journey.</p><section className="mt-12 grid gap-5 sm:grid-cols-3">{[["The problem", "Career guidance, skill building, and opportunities live in disconnected systems."], ["Our approach", "A connected journey turns your goals and growing skills into useful next steps."], ["Our proof standard", "Sample stories are labelled. Evidence requires review. Outcomes must be measured before claims are made."]].map(([title, text]) => <article key={title} className="premium-card p-6"><h2 className="font-semibold">{title}</h2><p className="premium-muted mt-3 text-sm leading-7">{text}</p></article>)}</section><section className="mt-20 grid items-center gap-10 lg:grid-cols-2"><div className="premium-card overflow-hidden p-4"><Image src="/team-photo.svg" width={1200} height={720} alt="Illustration of the six-member ArticXcoders product team collaborating" className="h-auto w-full rounded-xl" /><p className="premium-muted mt-3 text-xs">Team illustration</p></div><div><p className="premium-eyebrow">Built by ArticXcoders</p><h2 className="premium-heading mt-4">Six specialists, one connected product</h2><p className="premium-muted mt-4 leading-7">The team began with one question: how can a student discover a career, learn its skills, prove readiness, and find a relevant opportunity in one place?</p></div></section><section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{roles.map(([name, role, text]) => <article key={role} className="premium-card p-6"><h3 className="font-semibold">{name}</h3><p className="mt-2 text-sm font-medium text-accent">{role}</p><p className="premium-muted mt-3 text-sm leading-7">{text}</p></article>)}</section><section id="roadmap" className="mt-20 scroll-mt-24"><p className="premium-eyebrow">Delivery roadmap</p><h2 className="premium-heading mt-4">What is available and what comes next</h2><p className="premium-muted mt-4 max-w-3xl leading-7">These workflows are available in the product. Pilot evaluation is the next step for validating real student outcomes.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{delivery.map(({ icon: Icon, title, status, text }) => <article key={title} className="premium-card p-6"><span className="premium-icon"><Icon className="h-5 w-5" /></span><p className="premium-muted mt-4 text-xs">{status}</p><h3 className="mt-2 text-lg font-semibold">{title}</h3><p className="premium-muted mt-3 text-sm leading-7">{text}</p></article>)}</div><div className="premium-card mt-5 p-6"><h3 className="font-semibold">Next: evaluate outcomes and expand access</h3><p className="premium-muted mt-3 text-sm leading-7">Our priorities are pilot feedback, full multilingual content, and measured improvements in readiness. Advanced matching models remain a research item; current recommendations use explained assessment, eligibility, and weighted scoring.</p></div></section><section className="premium-featured mt-20 rounded-2xl p-8 text-center"><h2 className="text-3xl font-semibold">Help shape the pilot</h2><p className="premium-muted mx-auto mt-4 max-w-2xl leading-7">We are inviting students, institutions, parents, and employers to validate the next version.</p><Link href="/waitlist" className="premium-button mt-6">Join the waitlist</Link></section></div></div>;
}
