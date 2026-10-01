import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { PublicNav } from "../_components/public-nav";
import { DemoJourneyAnimation } from "./demo-journey";

export default function DemoPage() {
  return <div className="premium-page"><PublicNav /><div className="premium-section py-12 sm:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="premium-eyebrow">See the product in action</p><h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Interactive product demo</h1><p className="premium-muted mt-4 max-w-2xl leading-7">Follow a sample student from discovering a direction to preparing for opportunities. Choose any step to explore what changes and why.</p></div><span className="premium-muted flex shrink-0 items-center gap-2 text-sm"><Clock3 className="h-4 w-4" /> 3-minute walkthrough</span></div><DemoJourneyAnimation /><div className="premium-card mt-8 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8"><div><h2 className="text-xl font-semibold">Make the next step your own</h2><p className="premium-muted mt-2 text-sm leading-6">The demo uses illustrative data. Your account starts with your own profile and goals.</p></div><Link href="/signup/student" className="premium-button shrink-0">Create free account <ArrowRight className="h-4 w-4" /></Link></div></div></div>;
}
