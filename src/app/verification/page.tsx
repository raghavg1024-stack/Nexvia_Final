import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestCertificateVerification, reviewVerificationRequest, submitSkillEvidence } from "./actions";
import { CheckCircle2, Clock3, ExternalLink, ShieldCheck, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: ownRequests }, { data: certificates }] = await Promise.all([
    supabase.from("profiles").select("user_type").eq("id", user.id).single(),
    supabase.from("verification_requests").select("*").eq("requester_id", user.id).order("submitted_at", { ascending: false }),
    supabase.from("certificates").select("id,title,verification_status").eq("user_id", user.id).order("issued_at", { ascending: false }),
  ]);
  const reviewer = ['academia', 'recruiter', 'admin'].includes(String(profile?.user_type));
  const { data: queue } = reviewer
    ? await supabase.from("verification_requests").select("*").eq("status", "pending").neq("requester_id", user.id).order("submitted_at", { ascending: true })
    : { data: [] };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-500">Trust infrastructure</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Verification Center</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Submit proof once. Institutions and approved employers review it with a permanent audit trail.</p></div>
        <div className="flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-500"><ShieldCheck className="h-5 w-5" /> Accountable evidence</div>
      </header>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <form action={submitSkillEvidence} className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Verify a skill</h2><p className="mt-1 text-sm text-slate-400">Link a project, assessment, repository, or published result.</p>
          <div className="mt-5 grid gap-4"><input name="skill_name" required placeholder="Skill, for example React" className="rounded-xl border border-line bg-background px-4 py-3 text-sm" /><input name="evidence_url" required type="url" placeholder="https://evidence.example" className="rounded-xl border border-line bg-background px-4 py-3 text-sm" /><textarea name="evidence_summary" placeholder="What this evidence proves" className="min-h-24 rounded-xl border border-line bg-background px-4 py-3 text-sm" /><button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500">Submit for approval</button></div>
        </form>
        <form action={requestCertificateVerification} className="rounded-2xl border border-line bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground">Verify a certificate</h2><p className="mt-1 text-sm text-slate-400">Connect an issued certificate to the authority&apos;s proof page.</p>
          <div className="mt-5 grid gap-4"><select name="certificate_id" required className="rounded-xl border border-line bg-background px-4 py-3 text-sm"><option value="">Choose certificate</option>{(certificates ?? []).map((certificate) => <option key={certificate.id} value={certificate.id}>{certificate.title} · {certificate.verification_status}</option>)}</select><input name="evidence_url" required type="url" placeholder="Verification URL" className="rounded-xl border border-line bg-background px-4 py-3 text-sm" /><button className="rounded-xl border border-blue-500 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300">Request certificate review</button></div>
        </form>
      </section>
      <section className="mt-8 rounded-2xl border border-line bg-card p-6"><h2 className="text-lg font-bold text-foreground">Your verification history</h2><div className="mt-5 grid gap-3">{(ownRequests ?? []).length === 0 ? <p className="text-sm text-slate-400">No requests yet. Project requests also appear here automatically.</p> : (ownRequests ?? []).map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-line bg-background p-4 sm:flex-row sm:items-center"><StatusIcon status={item.status} /><div className="min-w-0 flex-1"><p className="font-semibold text-foreground">{item.subject_label}</p><p className="text-xs text-slate-400">{item.subject_type} · {item.status.replace('_', ' ')}</p>{item.reviewer_notes && <p className="mt-1 text-sm text-slate-400">{item.reviewer_notes}</p>}</div><a href={item.evidence_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500">Evidence <ExternalLink className="h-4 w-4" /></a></article>)}</div></section>
      {reviewer && <section className="mt-8 rounded-2xl border border-blue-400/30 bg-blue-950 p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-300">Reviewer queue</p><h2 className="mt-1 text-xl font-bold">Evidence awaiting a decision</h2></div><span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-200">{(queue ?? []).length} pending</span></div><div className="mt-5 grid gap-4">{(queue ?? []).map((item) => <form action={reviewVerificationRequest} key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4"><input type="hidden" name="id" value={item.id} /><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.subject_label}</p><p className="text-xs text-slate-400">{item.subject_type} · submitted {new Date(item.submitted_at).toLocaleDateString()}</p></div><a href={item.evidence_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-300">Inspect evidence</a></div><textarea name="notes" placeholder="Reviewer notes" className="mt-4 min-h-20 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm" /><div className="mt-3 flex flex-wrap gap-2"><button name="decision" value="approved" className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white">Approve</button><button name="decision" value="changes_requested" className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950">Request changes</button><button name="decision" value="rejected" className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-bold text-white">Reject</button></div></form>)}{(queue ?? []).length === 0 && <p className="text-sm text-slate-400">The review queue is clear.</p>}</div></section>}
    </main>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "approved") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "rejected") return <XCircle className="h-5 w-5 text-rose-500" />;
  return <Clock3 className="h-5 w-5 text-amber-500" />;
}
