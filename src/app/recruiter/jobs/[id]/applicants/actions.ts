"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: app } = await supabase
    .from("job_applications")
    .select("job_id, user_id, status")
    .eq("id", applicationId)
    .single();

  if (!app) throw new Error("Application not found");

  const { data: job } = await supabase
    .from("jobs")
    .select("title, company_id")
    .eq("id", app.job_id)
    .single();

  if (!job) throw new Error("Job not found");

  const { data: membership } = await supabase
    .from("company_members")
    .select("*")
    .eq("company_id", job.company_id)
    .eq("user_id", user.id)
    .single();

  if (!membership) throw new Error("Not authorized");

  const { error } = await supabase
    .from("job_applications")
    .update({ 
      status: newStatus,
      status_changed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) throw error;

  // Create notification for student
  await supabase.rpc("insert_notification", {
    p_user_id: app.user_id,
    p_type: "application_status",
    p_title: `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    p_message: `Your application for "${job.title}" has been ${newStatus.toLowerCase()}.`,
    p_data: { application_id: applicationId, job_id: app.job_id, new_status: newStatus }
  });

  return { ok: true };
}