import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NexviaLogoMark } from "./nexvia-logo";

const links = [
  ["/#product", "Product"],
  ["/#students", "Students"],
  ["/#colleges", "Colleges"],
  ["/#recruiters", "Recruiters"],
  ["/demo", "Demo"],
  ["/waitlist", "Pilot"],
  ["/contact", "Contact"],
];

export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-[0_10px_30px_rgba(30,58,138,.06)] backdrop-blur-xl">
      <nav aria-label="Public navigation" className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <NexviaLogoMark href="/" />
        <div className="hidden items-center gap-4 text-sm text-slate-400 lg:flex xl:gap-6">
          {links.map(([href, label]) => <Link key={href} href={href} className="transition hover:text-white">{label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <details className="group relative lg:hidden"><summary className="cursor-pointer list-none rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 marker:hidden">Menu</summary><div className="absolute right-0 top-12 z-50 w-52 space-y-1 rounded-2xl border border-white/10 bg-[#0d1220] p-2 shadow-2xl">{links.map(([href, label]) => <Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">{label}</Link>)}<Link href="/login" className="block rounded-xl px-3 py-2.5 text-sm text-cyan-300 hover:bg-white/5">Sign in</Link></div></details>
          <Link href="/login" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 sm:inline-flex">Sign in</Link>
          <Link href="/demo" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600">View demo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </nav>
    </header>
  );
}
