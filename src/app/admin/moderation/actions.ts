"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const tables = new Set(["companies", "institutions", "jobs", "faculty_opportunities", "industry_collaborations"]);

export async function moderateEntity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  if (profile?.user_type !== "admin") throw new Error("Administrator access is required.");
  const table = String(formData.get("table") ?? "");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  if (!tables.has(table) || !['approved', 'rejected', 'suspended'].includes(decision)) throw new Error("Invalid moderation request.");
  const values: Record<string, unknown> = {
    moderation_status: decision, moderated_by: user.id, moderated_at: new Date().toISOString(), moderation_notes: notes || null,
  };
  if (table === "jobs" && decision === "approved") values.verified_at = new Date().toISOString().slice(0, 10);
  if (table === "faculty_opportunities" && decision === "approved") values.status = "open";
  const { error } = await supabase.from(table).update(values).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/moderation");
  revalidatePath("/jobs");
}
