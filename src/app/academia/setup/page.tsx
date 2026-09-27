import { BriefcaseBusiness, GraduationCap, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AcademiaSetupForm } from "./setup-form";

type StoredAcademiaProfile = {
  institution?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  years_experience?: number;
  skills?: string[];
  phone?: string;
  location?: string;
  linkedin_url?: string;
  collaboration_preferences?: string[];
  availability?: string;
  professional_summary?: string;
};

export default async function AcademiaSetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, major, skill_tags, goals").eq("id", user.id).maybeSingle()
    : { data: null };
  const stored = (user?.user_metadata?.academia_profile ?? {}) as StoredAcademiaProfile;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      <section className="rounded-3xl border border-cyan-400/20 bg-card p-6 shadow-2xl shadow-black/15 sm:p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><GraduationCap className="h-6 w-6" /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">Academia professional onboarding</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">Complete your professional profile</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">Add the information normally requested during professional or company onboarding. Nexvia uses it to personalize collaboration opportunities and institution insights.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-line bg-background/60 p-4 text-sm text-slate-300"><BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" /> Skills, experience, designation, qualification, and availability</div>
          <div className="flex items-start gap-3 rounded-xl border border-line bg-background/60 p-4 text-sm text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /> These details support your workspace profile and are not used to authorize your account role</div>
        </div>
        <AcademiaSetupForm defaults={{
          full_name: profile?.full_name ?? "",
          institution: stored.institution,
          designation: stored.designation,
          department: stored.department ?? profile?.major ?? "",
          qualification: stored.qualification,
          years_experience: stored.years_experience,
          skills: stored.skills ?? profile?.skill_tags ?? [],
          phone: stored.phone,
          location: stored.location,
          linkedin_url: stored.linkedin_url,
          collaboration_preferences: stored.collaboration_preferences,
          availability: stored.availability,
          professional_summary: stored.professional_summary ?? profile?.goals ?? "",
        }} />
      </section>
    </main>
  );
}
