"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function session() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  return { supabase, user, role: String(profile?.user_type ?? "student") };
}

function evidenceUrl(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  const parsed = new URL(raw);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("Evidence must use an HTTP or HTTPS URL.");
  return parsed.toString();
}

export async function submitSkillEvidence(formData: FormData) {
  const { supabase, user } = await session();
  const skillName = String(formData.get("skill_name") ?? "").trim();
  const summary = String(formData.get("evidence_summary") ?? "").trim();
  if (skillName.length < 2) throw new Error("Enter a skill name.");
  const url = evidenceUrl(formData.get("evidence_url"));
  const { data: item, error } = await supabase.from("student_skill_evidence").insert({
    user_id: user.id, skill_name: skillName, evidence_url: url,
    evidence_summary: summary || null, verification_status: "pending_verification",
  }).select("id").single();
  if (error || !item) throw new Error(error?.message ?? "Could not submit evidence.");
  const { error: requestError } = await supabase.from("verification_requests").insert({
    requester_id: user.id, subject_type: "skill", subject_table: "student_skill_evidence",
    subject_id: item.id, subject_label: skillName, evidence_url: url,
  });
  if (requestError) throw new Error(requestError.message);
  revalidatePath("/verification");
}

export async function requestCertificateVerification(formData: FormData) {
  const { supabase, user } = await session();
  const certificateId = String(formData.get("certificate_id") ?? "");
  const url = evidenceUrl(formData.get("evidence_url"));
  const { data: certificate } = await supabase.from("certificates").select("id,title").eq("id", certificateId).eq("user_id", user.id).single();
  if (!certificate) throw new Error("Certificate was not found.");
  const { data: request, error } = await supabase.from("verification_requests").insert({
    requester_id: user.id, subject_type: "certificate", subject_table: "certificates",
    subject_id: certificate.id, subject_label: certificate.title, evidence_url: url,
  }).select("id").single();
  if (error || !request) throw new Error(error?.message ?? "Could not request verification.");
  const { error: updateError } = await supabase.from("certificates").update({
    verification_status: "pending_verification", verification_source: url, verification_id: request.id,
  }).eq("id", certificate.id).eq("user_id", user.id);
  if (updateError) throw new Error(updateError.message);
  revalidatePath("/verification");
}

export async function reviewVerificationRequest(formData: FormData) {
  const { supabase, user, role } = await session();
  if (!['academia', 'recruiter', 'admin'].includes(role)) throw new Error("Reviewer access is required.");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!['approved', 'rejected', 'changes_requested'].includes(decision)) throw new Error("Choose a valid decision.");
  const { data: request } = await supabase.from("verification_requests").select("*").eq("id", id).eq("status", "pending").single();
  if (!request || request.requester_id === user.id) throw new Error("This request cannot be reviewed by this account.");
  if (request.subject_type === "opportunity" && role !== "admin") throw new Error("Only administrators can verify opportunities.");
  const status = decision === "approved" ? "verified" : "self_reported";
  const { error: reviewError } = await supabase.from("verification_requests").update({
    status: decision, reviewer_id: user.id, reviewer_role: role, reviewer_notes: notes || null,
    reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", id).eq("status", "pending");
  if (reviewError) throw new Error(reviewError.message);
  const update = { verification_status: status, verification_id: id };
  const { error: subjectError } = await supabase.from(request.subject_table).update(update).eq("id", request.subject_id);
  if (subjectError) throw new Error(subjectError.message);
  await supabase.from("notifications").insert({
    user_id: request.requester_id, type: "verification",
    title: decision === "approved" ? "Evidence verified" : "Verification update",
    message: `${request.subject_label} was ${decision.replace('_', ' ')}.${notes ? ` ${notes}` : ""}`,
    data: { verification_request_id: id }, dedupe_key: `verification:${id}:${decision}`,
  });
  revalidatePath("/verification");
}
