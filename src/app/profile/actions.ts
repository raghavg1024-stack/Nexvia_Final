"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type UpdateProfileState = { error?: string | null };

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const educationLevel = String(formData.get("education_level") ?? "").trim();
  const learningStyle = String(formData.get("learning_style") ?? "").trim();
  const goals = String(formData.get("goals") ?? "").trim();
  const rawHours = formData.get("study_hours_per_week");
  const hours = rawHours === null || rawHours === "" ? null : Number(rawHours);
  
  const rawCgpa = formData.get("cgpa");
  const cgpa = rawCgpa === null || rawCgpa === "" ? null : Number(rawCgpa);
  
  const rawGradYear = formData.get("graduation_year");
  const graduation_year = rawGradYear === null || rawGradYear === "" ? null : Number(rawGradYear);
  
  const major = String(formData.get("major") ?? "").trim();
  const parseNumber = (name: string) => {
    const value = formData.get(name);
    return value === null || value === "" ? null : Number(value);
  };
  const current_percentage = parseNumber("current_percentage");
  const tenth_percentage = parseNumber("tenth_percentage");
  const twelfth_percentage = parseNumber("twelfth_percentage");
  const rawSkills = String(formData.get("skill_tags") ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const skill_tags = rawSkills
    .filter((skill, index) => rawSkills.findIndex((item) => item.toLowerCase() === skill.toLowerCase()) === index)
    .slice(0, 30);
  const open_to_recruiters = formData.get("open_to_recruiters") === "on";
  const gender = String(formData.get("gender") ?? "").trim();
  const social_category = String(formData.get("social_category") ?? "").trim();
  const disability_percentage = parseNumber("disability_percentage");
  const annual_family_income = parseNumber("annual_family_income");
  const domicile_state = String(formData.get("domicile_state") ?? "").trim();

  const outsideRange = (value: number | null, minimum: number, maximum: number) =>
    value !== null && (!Number.isFinite(value) || value < minimum || value > maximum);
  if (outsideRange(cgpa, 0, 10)) return { error: "CGPA must be between 0 and 10." };
  if (hours !== null && (!Number.isFinite(hours) || hours < 0 || hours > 168)) {
    return { error: "Study hours must be between 0 and 168 per week." };
  }
  const currentYear = new Date().getFullYear();
  if (graduation_year !== null && (!Number.isInteger(graduation_year) || graduation_year < currentYear - 20 || graduation_year > currentYear + 15)) {
    return { error: "Please enter a realistic graduation year." };
  }
  if (fullName.length > 100 || major.length > 100 || goals.length > 2_000) {
    return { error: "One or more profile fields are too long." };
  }
  if ([current_percentage, tenth_percentage, twelfth_percentage, disability_percentage].some((value) => outsideRange(value, 0, 100))) {
    return { error: "Marks and disability percentage must be between 0 and 100." };
  }
  if (annual_family_income !== null && (!Number.isFinite(annual_family_income) || annual_family_income < 0)) {
    return { error: "Annual family income cannot be negative." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      email: email || null,
      education_level: educationLevel || null,
      learning_style: learningStyle || null,
      goals: goals || null,
      study_hours_per_week: hours !== null && Number.isFinite(hours) ? hours : null,
      cgpa: cgpa !== null && Number.isFinite(cgpa) ? cgpa : null,
      graduation_year: graduation_year !== null && Number.isFinite(graduation_year) ? graduation_year : null,
      major: major || null,
      current_percentage: current_percentage !== null && Number.isFinite(current_percentage) ? current_percentage : null,
      tenth_percentage: tenth_percentage !== null && Number.isFinite(tenth_percentage) ? tenth_percentage : null,
      twelfth_percentage: twelfth_percentage !== null && Number.isFinite(twelfth_percentage) ? twelfth_percentage : null,
      skill_tags,
      open_to_recruiters,
      gender: gender || null,
      social_category: social_category || null,
      disability_percentage: disability_percentage !== null && Number.isFinite(disability_percentage) ? disability_percentage : null,
      annual_family_income: annual_family_income !== null && Number.isFinite(annual_family_income) ? annual_family_income : null,
      domicile_state: domicile_state || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  const { error: candidateError } = await supabase.from("candidate_profiles").upsert({
    user_id: user.id,
    display_name: fullName || user.email?.split("@")[0] || "Nexvia learner",
    cgpa: cgpa !== null && Number.isFinite(cgpa) ? cgpa : null,
    current_percentage: current_percentage !== null && Number.isFinite(current_percentage) ? current_percentage : null,
    major: major || null,
    skill_tags,
    open_to_recruiters,
    updated_at: new Date().toISOString(),
  });
  if (candidateError) return { error: candidateError.message };

  revalidatePath("/profile");
  redirect("/profile");
}
