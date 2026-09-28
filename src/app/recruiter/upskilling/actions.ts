"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function recruiterSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const { data: membership } = await supabase.from("company_members").select("company_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership) throw new Error("Create or join a company first.");
  return { supabase, user, companyId: membership.company_id };
}

const list = (value: FormDataEntryValue | null) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 30);

export async function createCohort(formData: FormData) {
  const { supabase, user, companyId } = await recruiterSession();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) throw new Error("Enter a cohort name.");
  const { error } = await supabase.from("employer_cohorts").insert({
    company_id: companyId, created_by: user.id, name,
    description: String(formData.get("description") ?? "").trim() || null,
    target_role: String(formData.get("target_role") ?? "").trim() || null,
    starts_on: String(formData.get("starts_on") ?? "") || null,
    ends_on: String(formData.get("ends_on") ?? "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/recruiter/upskilling");
}

export async function addCohortMember(formData: FormData) {
  const { supabase, companyId } = await recruiterSession();
  const cohortId = String(formData.get("cohort_id") ?? "");
  const { data: cohort } = await supabase.from("employer_cohorts").select("id").eq("id", cohortId).eq("company_id", companyId).single();
  if (!cohort) throw new Error("Cohort not found.");
  const { error } = await supabase.from("employer_cohort_members").insert({
    cohort_id: cohortId, employee_name: String(formData.get("employee_name") ?? "").trim(),
    employee_email: String(formData.get("employee_email") ?? "").trim().toLowerCase(),
    current_skills: list(formData.get("current_skills")), target_skills: list(formData.get("target_skills")),
    readiness_score: Math.max(0, Math.min(100, Number(formData.get("readiness_score") ?? 0))),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/recruiter/upskilling");
}

export async function createTrainingAssignment(formData: FormData) {
  const { supabase, user, companyId } = await recruiterSession();
  const cohortId = String(formData.get("cohort_id") ?? "");
  const { data: cohort } = await supabase.from("employer_cohorts").select("id").eq("id", cohortId).eq("company_id", companyId).single();
  if (!cohort) throw new Error("Cohort not found.");
  const { data: assignment, error } = await supabase.from("training_assignments").insert({
    cohort_id: cohortId, created_by: user.id, title: String(formData.get("title") ?? "").trim(),
    skill_name: String(formData.get("skill_name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    resource_url: String(formData.get("resource_url") ?? "").trim() || null,
    due_at: String(formData.get("due_at") ?? "") || null,
  }).select("id").single();
  if (error || !assignment) throw new Error(error?.message ?? "Could not create training.");
  const { data: members } = await supabase.from("employer_cohort_members").select("id,employee_user_id").eq("cohort_id", cohortId);
  if (members?.length) await supabase.from("training_assignment_progress").insert(members.map((member) => ({ assignment_id: assignment.id, member_id: member.id })));
  const users = (members ?? []).filter((member) => member.employee_user_id).map((member) => ({
    user_id: member.employee_user_id, type: "training", title: "New training assigned",
    message: `${String(formData.get("title") ?? "Training")} has been assigned to your cohort.`,
    data: { assignment_id: assignment.id }, dedupe_key: `training:${assignment.id}:${member.employee_user_id}`,
  }));
  if (users.length) await supabase.from("notifications").insert(users);
  revalidatePath("/recruiter/upskilling");
}
