import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Thank You", description: "Your Nexvia submission has been received.", robots: { index: false, follow: false } };

const messages = { waitlist: ["You’re on the waitlist", "We saved your place and will contact you about pilot access."], contact: ["Message received", "The ArticXcoders team will review your enquiry."], review: ["Review submitted", "Thank you. Your verified review will appear after moderation."] } as const;

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const key = (await searchParams).for as keyof typeof messages;
  const [title, description] = messages[key] ?? ["Thank you", "Your submission has been received."];
  return <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-5 py-16 text-center"><div className="w-full rounded-3xl border border-emerald-300/20 bg-emerald-400/[.05] p-10"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl text-emerald-300">✓</span><h1 className="mt-6 font-display text-4xl uppercase text-white">{title}</h1><p className="mx-auto mt-4 max-w-xl text-slate-400">{description}</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/" className="rounded-xl bg-white px-5 py-3 font-bold text-slate-950">Return home</Link><Link href="/about" className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-white">Learn about Nexvia</Link></div></div></main>;
}
