"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { IndustryCollaboration } from "@/lib/types";

export type CollaborationActionState = { error?: string | null; ok?: boolean };

export async function getCollaborationsData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { collaborations: [], membership: null };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) return { collaborations: [], membership: null };

  const { data: collaborations } = await supabase
    .from("industry_collaborations")
    .select("*")
    .eq("company_id", membership.company_id)
    .order("created_at", { ascending: false });

  return { collaborations: collaborations as IndustryCollaboration[] || [], membership };
}

export async function createCollaborationAction(
  _prevState: CollaborationActionState,
  formData: FormData
): Promise<CollaborationActionState> {
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
  const start_date = formData.get("start_date") as string || null;
  const end_date = formData.get("end_date") as string || null;
  const status = formData.get("status") as string || "proposed";
  const participants = formData.get("participants") ? Number(formData.get("participants")) : null;
  const outcomes = formData.get("outcomes") as string || null;

  const { error } = await supabase.from("industry_collaborations").insert({
    company_id: membership.company_id,
    title,
    type,
    description,
    start_date,
    end_date,
    status,
    participants,
    outcomes,
  });

  if (error) return { error: error.message };

  revalidatePath("/recruiter/collaborations");
  return { ok: true };
}

export async function updateCollaborationAction(
  _prevState: CollaborationActionState,
  formData: FormData
): Promise<CollaborationActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { data: collab } = await supabase.from("industry_collaborations").select("*").eq("id", id).single();
  if (!collab) return { error: "Collaboration not found" };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("company_id", collab.company_id)
    .single();
  if (!membership) return { error: "Not authorized to update this collaboration" };

  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const start_date = formData.get("start_date") as string || null;
  const end_date = formData.get("end_date") as string || null;
  const status = formData.get("status") as string;
  const participants = formData.get("participants") ? Number(formData.get("participants")) : null;
  const outcomes = formData.get("outcomes") as string || null;

  const { error } = await supabase.from("industry_collaborations").update({
    title,
    type,
    description,
    start_date,
    end_date,
    status,
    participants,
    outcomes,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/recruiter/collaborations");
  return { ok: true };
}

export async function deleteCollaborationAction(
  _prevState: CollaborationActionState,
  formData: FormData
): Promise<CollaborationActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { data: collab } = await supabase.from("industry_collaborations").select("*").eq("id", id).single();
  if (!collab) return { error: "Collaboration not found" };

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("company_id", collab.company_id)
    .single();
  if (!membership) return { error: "Not authorized to delete this collaboration" };

  const { error } = await supabase.from("industry_collaborations").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/recruiter/collaborations");
  return { ok: true };
}