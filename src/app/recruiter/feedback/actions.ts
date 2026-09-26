"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FeedbackActionState = { error?: string | null; ok?: boolean };

export interface ApplicationForFeedback {
  id: string;
  status: string;
  applied_at: string;
  profiles: {
    id: string | null;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  jobs: {
    id: string;
    title: string;
    company_id: string;
  };
}

export async function getFeedbackData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { applications: [], membership: null };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return { applications: [], membership: null };

  const { data: applications } = await supabase
    .from("job_applications")
    .select(`
      id,
      status,
      applied_at,
      user_id,
      job_id,
      profiles!inner(id, full_name, email, avatar_url),
      jobs!inner(id, title, company_id)
    `)
    .eq("jobs.company_id", membership.company_id)
    .in("status", ["accepted", "reviewed"])
    .order("applied_at", { ascending: false });

  const normalizedApplications = (applications || []).flatMap((application) => {
    const profile = Array.isArray(application.profiles) ? application.profiles[0] : application.profiles;
    const job = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;
    if (!profile || !job) return [];

    return [{
      id: application.id,
      status: application.status,
      applied_at: application.applied_at,
      profiles: profile,
      jobs: job,
    } satisfies ApplicationForFeedback];
  });

  return { applications: normalizedApplications, membership };
}

export async function submitFeedbackAction(
  _prevState: FeedbackActionState,
  formData: FormData
): Promise<FeedbackActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const job_application_id = formData.get("job_application_id") as string;
  const rating = Number(formData.get("rating"));
  const technical_skills_rating = Number(formData.get("technical_skills_rating")) || null;
  const communication_rating = Number(formData.get("communication_rating")) || null;
  const teamwork_rating = Number(formData.get("teamwork_rating")) || null;
  const reliability_rating = Number(formData.get("reliability_rating")) || null;
  const strengths = formData.get("strengths") as string || null;
  const improvement_areas = formData.get("improvement_areas") as string || null;
  const would_recommend = formData.get("would_recommend") === "on";
  const is_public = formData.get("is_public") === "on";

  if (!job_application_id || !rating || rating < 1 || rating > 5) {
    return { error: "Valid overall rating (1-5) is required" };
  }

  const { data: application } = await supabase
    .from("job_applications")
    .select("jobs!inner(company_id)")
    .eq("id", job_application_id)
    .single();

  const job = application
    ? Array.isArray(application.jobs) ? application.jobs[0] : application.jobs
    : null;
  if (!job) return { error: "Application not found" };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("company_id", job.company_id)
    .single();

  if (!membership) return { error: "Not authorized to provide feedback for this application" };

  const { error } = await supabase.from("internship_feedback").upsert({
    job_application_id,
    reviewer_id: user.id,
    rating,
    technical_skills_rating,
    communication_rating,
    teamwork_rating,
    reliability_rating,
    strengths,
    improvement_areas,
    would_recommend,
    is_public,
  }, { onConflict: "job_application_id" });

  if (error) return { error: error.message };

  revalidatePath("/recruiter/feedback");
  redirect("/recruiter/feedback");
}
