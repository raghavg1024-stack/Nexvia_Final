import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Building2, BriefcaseBusiness, GraduationCap, Network, ShieldCheck } from "lucide-react";
import { moderateEntity } from "./actions";

export const dynamic = "force-dynamic";

const sources = [
  { table: "companies", label: "Recruiters & companies", icon: Building2 },
  { table: "institutions", label: "Academic institutions", icon: GraduationCap },
  { table: "jobs", label: "Jobs & internships", icon: BriefcaseBusiness },
  { table: "faculty_opportunities", label: "Faculty opportunities & FDPs", icon: Network },
  { table: "industry_collaborations", label: "Research & collaborations", icon: ShieldCheck },
] as const;

export default async function ModerationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  if (profile?.user_type !== "admin") redirect("/dashboard");
  const results = await Promise.all(sources.map(async (source) => {
    const { data } = await supabase.from(source.table).select("*").eq("moderation_status", "pending").order("created_at", { ascending: true }).limit(50);
    return { ...source, items: data ?? [] };
  }));
  const total = results.reduce((sum, source) => sum + source.items.length, 0);

  return <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
    <header className="rounded-3xl border border-blue-400/20 bg-blue-950 p-7 text-white shadow-xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">Platform trust desk</p><h1 className="mt-2 text-3xl font-bold">Admin Moderation</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Approve organizations and listings before they enter student, faculty, and research discovery surfaces.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center"><p className="text-3xl font-bold">{total}</p><p className="text-xs uppercase tracking-widest text-slate-400">Pending</p></div></div></header>
    <div className="mt-8 grid gap-6">{results.map(({ table, label, icon: Icon, items }) => <section key={table} className="rounded-2xl border border-line bg-card p-6 shadow-sm"><div className="flex items-center justify-between"><h2 className="flex items-center gap-3 text-lg font-bold text-foreground"><span className="rounded-lg bg-blue-100 p-2 text-blue-700"><Icon className="h-5 w-5" /></span>{label}</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{items.length}</span></div><div className="mt-5 grid gap-4">{items.length === 0 ? <p className="rounded-xl border border-dashed border-line p-5 text-sm text-slate-400">Nothing waiting in this queue.</p> : items.map((item: Record<string, unknown>) => <form action={moderateEntity} key={String(item.id)} className="rounded-xl border border-line bg-background p-4"><input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={String(item.id)} /><div><p className="font-semibold text-foreground">{String(item.name ?? item.title ?? "Untitled submission")}</p><p className="mt-1 line-clamp-2 text-sm text-slate-400">{String(item.description ?? item.type ?? "Review identity and supporting information before approval.")}</p></div><textarea name="notes" placeholder="Moderation notes" className="mt-4 min-h-20 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-foreground" /><div className="mt-3 flex gap-2"><button name="decision" value="approved" className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Approve</button><button name="decision" value="rejected" className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white">Reject</button><button name="decision" value="suspended" className="rounded-lg border border-line px-4 py-2 text-xs font-bold text-foreground">Suspend</button></div></form>)}</div></section>)}</div>
  </main>;
}
