"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type FacultyApplyActionState = { error?: string | null; ok?: boolean; success?: boolean };

export async function getFacultyOpportunity(id: string) {
  const supabase = await createClient();
  const { data: opportunity } = await supabase
    .from("faculty_opportunities")
    .select(`
      *,
      companies (name, logo_url)
    `)
    .eq("id", id)
    .single();

  return opportunity;
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
  const profile_url = formData.get("profile_url") as string || null;

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