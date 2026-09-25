"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ApplicationActionState = { error?: string | null; ok?: boolean };

export async function getApplicationsData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { applications: [], jobApplications: [] };

  const [{ data: applications }, { data: jobApplications }] = await Promise.all([
    supabase
      .from("student_applications")
      .select("*")
      .eq("user_id", user.id)
      .order("applied_at", { ascending: false }),
    supabase
      .from("job_applications")
      .select(`
        *,
        jobs (title, company_id, role_type, companies (name, logo_url))
      `)
      .eq("user_id", user.id)
      .order("applied_at", { ascending: false }),
  ]);

  return { applications: applications || [], jobApplications: jobApplications || [] };
}

export async function updateApplicationAction(
  _prevState: ApplicationActionState,
  formData: FormData
): Promise<ApplicationActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;
  const application_type = formData.get("application_type") as string;
  const title = formData.get("title") as string;
  const company_name = formData.get("company_name") as string;
  const status = formData.get("status") as string;
  const applied_at = formData.get("applied_at") as string;
  const match_score = formData.get("match_score") ? Number(formData.get("match_score")) : null;
  const notes = formData.get("notes") as string || null;
  const interview_dates = formData.get("interview_dates") as string;
  const offer_details = formData.get("offer_details") as string;

  const { data: app } = await supabase.from("student_applications").select("user_id").eq("id", id).single();
  if (!app || app.user_id !== user.id) return { error: "Not authorized to update this application" };

  let interviewDatesArray: string[] = [];
  try {
    interviewDatesArray = interview_dates.split("\n").map(s => s.trim()).filter(Boolean);
  } catch {}

  let offerDetailsObj: any = null;
  try {
    offerDetailsObj = offer_details ? JSON.parse(offer_details) : null;
  } catch {}

  const { error } = await supabase.from("student_applications").update({
    application_type,
    title,
    company_name,
    status,
    applied_at: applied_at || new Date().toISOString(),
    match_score,
    notes,
    interview_dates: interviewDatesArray,
    offer_details: offerDetailsObj,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/applications");
  return { ok: true };
}

export async function deleteApplicationAction(
  _prevState: ApplicationActionState,
  formData: FormData
): Promise<ApplicationActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { data: app } = await supabase.from("student_applications").select("user_id").eq("id", id).single();
  if (!app || app.user_id !== user.id) return { error: "Not authorized to delete this application" };

  const { error } = await supabase.from("student_applications").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/applications");
  return { ok: true };
}