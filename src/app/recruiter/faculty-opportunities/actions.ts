"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type FacultyOpportunityActionState = { error?: string | null; ok?: boolean };

export async function getFacultyOpportunitiesData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { opportunities: [], membership: null };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return { opportunities: [], membership: null };

  const { data: opportunities } = await supabase
    .from("faculty_opportunities")
    .select("*")
    .eq("company_id", membership.company_id)
    .order("created_at", { ascending: false });

  return { opportunities: opportunities || [], membership };
}

export async function createFacultyOpportunityAction(
  _prevState: FacultyOpportunityActionState,
  formData: FormData
): Promise<FacultyOpportunityActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();
  if (!membership) return { error: "No company linked to your account" };

  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const duration_weeks = formData.get("duration_weeks") ? Number(formData.get("duration_weeks")) : null;
  const location = formData.get("location") as string || "Remote";
  const stipend_amount = formData.get("stipend_amount") as string || null;
  const application_deadline = formData.get("application_deadline") as string || null;
  const required_skills = formData.get("required_skills") as string;
  const application_url = formData.get("application_url") as string || null;
  const max_participants = formData.get("max_participants") ? Number(formData.get("max_participants")) : null;
  const status = formData.get("status") as string || "draft";

  const skillsArray = required_skills
    ? required_skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("faculty_opportunities").insert({
    company_id: membership.company_id,
    title,
    type,
    description,
    duration_weeks,
    location,
    stipend_amount,
    application_deadline,
    required_skills: skillsArray,
    application_url,
    max_participants,
    status,
  });

  if (error) return { error: error.message };

  revalidatePath("/recruiter/faculty-opportunities");
  redirect("/recruiter/faculty-opportunities");
}

export async function updateFacultyOpportunityAction(
  _prevState: FacultyOpportunityActionState,
  formData: FormData
): Promise<FacultyOpportunityActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { data: opp } = await supabase.from("faculty_opportunities").select("*").eq("id", id).single();
  if (!opp) return { error: "Opportunity not found" };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("company_id", opp.company_id)
    .single();
  if (!membership) return { error: "Not authorized to update this opportunity" };

  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const duration_weeks = formData.get("duration_weeks") ? Number(formData.get("duration_weeks")) : null;
  const location = formData.get("location") as string || "Remote";
  const stipend_amount = formData.get("stipend_amount") as string || null;
  const application_deadline = formData.get("application_deadline") as string || null;
  const required_skills = formData.get("required_skills") as string;
  const application_url = formData.get("application_url") as string || null;
  const max_participants = formData.get("max_participants") ? Number(formData.get("max_participants")) : null;
  const status = formData.get("status") as string;

  const skillsArray = required_skills
    ? required_skills.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("faculty_opportunities").update({
    title,
    type,
    description,
    duration_weeks,
    location,
    stipend_amount,
    application_deadline,
    required_skills: skillsArray,
    application_url,
    max_participants,
    status,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/recruiter/faculty-opportunities");
  redirect("/recruiter/faculty-opportunities");
}

export async function deleteFacultyOpportunityAction(
  _prevState: FacultyOpportunityActionState,
  formData: FormData
): Promise<FacultyOpportunityActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { data: opp } = await supabase.from("faculty_opportunities").select("*").eq("id", id).single();
  if (!opp) return { error: "Opportunity not found" };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("company_id", opp.company_id)
    .single();
  if (!membership) return { error: "Not authorized to delete this opportunity" };

  const { error } = await supabase.from("faculty_opportunities").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/recruiter/faculty-opportunities");
  redirect("/recruiter/faculty-opportunities");
}
