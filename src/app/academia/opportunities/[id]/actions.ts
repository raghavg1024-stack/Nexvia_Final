"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type FacultyApplyActionState = { error?: string | null; ok?: boolean; success?: boolean };

export interface FacultyOpportunityDetails {
  id: string;
  type: string;
  title: string;
  description: string;
  duration_weeks: number | null;
  application_deadline: string | null;
  location: string | null;
  stipend_amount: string | null;
  max_participants: number | null;
  required_skills: string[] | null;
  companies: { name: string | null; logo_url: string | null } | null;
}

export async function getFacultyOpportunity(id: string): Promise<FacultyOpportunityDetails | null> {
  const supabase = await createClient();
  const { data: opportunity } = await supabase
    .from("faculty_opportunities")
    .select(`
      *,
      companies (name, logo_url)
    `)
    .eq("id", id)
    .single();

  if (!opportunity) return null;
  const company = Array.isArray(opportunity.companies) ? opportunity.companies[0] ?? null : opportunity.companies;
  return { ...opportunity, companies: company } as FacultyOpportunityDetails;
}

export async function applyToFacultyOpportunityAction(
  _prevState: FacultyApplyActionState,
  formData: FormData
): Promise<FacultyApplyActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const profile = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  if (!profile.data || profile.data.user_type !== "academia") {
    return { error: "Only academicians can apply to faculty opportunities" };
  }

  const opportunity_id = formData.get("opportunity_id") as string;
  const full_name = formData.get("full_name") as string;
  const designation = formData.get("designation") as string;
  const department = formData.get("department") as string;
  const institution = formData.get("institution") as string;
  const experience_years = Number(formData.get("experience_years"));
  const expertise = formData.get("expertise") as string;
  const statement = formData.get("statement") as string;
  if (!opportunity_id || !full_name || !designation || !department || !institution || !experience_years || !expertise || !statement) {
    return { error: "All required fields must be filled" };
  }

  const { data: existing } = await supabase
    .from("faculty_applications")
    .select("id")
    .eq("opportunity_id", opportunity_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { error: "You have already applied to this opportunity" };
  }

  const { error } = await supabase.from("faculty_applications").insert({
    opportunity_id,
    user_id: user.id,
    status: "pending",
  });

  if (error) {
    if (error.code === '23505') {
      return { error: "You have already applied to this opportunity" };
    }
    return { error: error.message };
  }

  revalidatePath("/academia/opportunities");
  return { ok: true, success: true };
}
