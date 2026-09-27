"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AcademiaSetupState = { error: string | null };

function cleanList(value: FormDataEntryValue | null, limit: number) {
  const items = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return items
    .filter((item, index) => items.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, limit);
}

function validWebUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function saveAcademiaSetup(
  _previousState: AcademiaSetupState,
  formData: FormData,
): Promise<AcademiaSetupState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in with your academia account first." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.user_type !== "academia") {
    return { error: "This onboarding form is only available to academia accounts." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const institution = String(formData.get("institution") ?? "").trim();
  const designation = String(formData.get("designation") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const qualification = String(formData.get("qualification") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const linkedIn = String(formData.get("linkedin_url") ?? "").trim();
  const availability = String(formData.get("availability") ?? "").trim();
  const professionalSummary = String(formData.get("professional_summary") ?? "").trim();
  const skills = cleanList(formData.get("skills"), 30);
  const collaborationPreferences = cleanList(formData.get("collaboration_preferences"), 10);
  const experienceInput = String(formData.get("years_experience") ?? "").trim();
  const yearsExperience = experienceInput ? Number(experienceInput) : 0;

  if (!fullName || !institution || !designation || !department || !qualification || skills.length === 0) {
    return { error: "Complete all required professional fields and add at least one skill." };
  }
  if ([fullName, institution, designation, department, qualification, location].some((value) => value.length > 120)) {
    return { error: "One or more professional details are too long." };
  }
  if (!Number.isFinite(yearsExperience) || yearsExperience < 0 || yearsExperience > 70) {
    return { error: "Years of experience must be between 0 and 70." };
  }
  if (phone && !/^\+?[0-9 ()-]{8,20}$/.test(phone)) {
    return { error: "Enter a valid professional phone number." };
  }
  if (!validWebUrl(linkedIn)) {
    return { error: "Enter a valid LinkedIn or professional profile URL." };
  }
  if (professionalSummary.length < 30 || professionalSummary.length > 1_500) {
    return { error: "Professional summary must be between 30 and 1,500 characters." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      major: department,
      skill_tags: skills,
      goals: professionalSummary,
    })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  const academiaProfile = {
    institution,
    designation,
    department,
    qualification,
    years_experience: yearsExperience,
    skills,
    phone,
    location,
    linkedin_url: linkedIn,
    collaboration_preferences: collaborationPreferences,
    availability,
    professional_summary: professionalSummary,
    completed_at: new Date().toISOString(),
  };
  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      academia_onboarding_complete: true,
      academia_profile: academiaProfile,
    },
  });
  if (metadataError) return { error: metadataError.message };

  revalidatePath("/academia");
  revalidatePath("/profile");
  redirect("/academia");
}
