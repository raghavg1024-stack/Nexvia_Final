import Link from "next/link";
import { NexviaLogoMark } from "./nexvia-logo";

const links = [["/#product", "Product"], ["/#students", "Students"], ["/#colleges", "Institutions"], ["/#recruiters", "Employers"], ["/about", "About"]];

export function PublicNav() {
  return <header className="premium-public-nav sticky top-0 z-40 border-b border-line backdrop-blur-xl"><nav aria-label="Public navigation" className="premium-section flex h-[4.5rem] items-center justify-between gap-3"><NexviaLogoMark href="/" className="min-h-11 shrink-0" /><div className="premium-muted hidden items-center gap-6 text-sm font-medium lg:flex">{links.map(([href, label]) => <Link key={href} href={href} className="hover:text-accent">{label}</Link>)}</div><div className="flex items-center gap-2"><details className="relative lg:hidden"><summary className="premium-button-secondary cursor-pointer list-none px-3 marker:hidden">Menu</summary><div className="premium-card absolute right-0 top-14 z-50 w-52 p-2">{[...links, ["/login", "Sign in"]].map(([href, label]) => <Link key={href} href={href} className="block rounded-lg px-3 py-3 text-sm hover:bg-accent-soft">{label}</Link>)}</div></details><Link href="/login" className="premium-muted hidden min-h-11 items-center px-3 text-sm font-semibold hover:text-accent sm:inline-flex">Sign in</Link><Link href="/signup/student" className="premium-button px-4 text-sm">Get started</Link></div></nav></header>;
}
