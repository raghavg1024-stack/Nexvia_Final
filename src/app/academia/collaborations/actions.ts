"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IndustryCollaboration } from "@/lib/types";

export type CollaborationActionState = { error?: string | null; ok?: boolean };

export async function getCollaborations(): Promise<IndustryCollaboration[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: collaborations } = await supabase
    .from("industry_collaborations")
    .select("*")
    .or(`institution_id.eq.${user.id},academician_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return collaborations as IndustryCollaboration[] || [];
}

export async function createCollaborationAction(_prev: CollaborationActionState, formData: FormData): Promise<CollaborationActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const profile = await supabase.from("profiles").select("user_type").eq("id", user.id).single();
  if (!profile.data || (profile.data.user_type !== "academia" && profile.data.user_type !== "recruiter")) {
    return { error: "Only academicians and industry partners can create collaborations" };
  }

  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const start_date = formData.get("start_date") as string || null;
  const end_date = formData.get("end_date") as string || null;
  const status = formData.get("status") as string || "proposed";
  const participants = formData.get("participants") ? Number(formData.get("participants")) : null;
  const outcomes = formData.get("outcomes") as string || null;

  const companyId = profile.data.user_type === "recruiter"
    ? (await supabase.from("company_members").select("company_id").eq("user_id", user.id).single()).data?.company_id
    : null;

  if (profile.data.user_type === "recruiter" && !companyId) {
    return { error: "No company linked to your account" };
  }

  const { error } = await supabase.from("industry_collaborations").insert({
    company_id: companyId!,
    institution_id: profile.data.user_type === "academia" ? user.id : null,
    academician_id: profile.data.user_type === "academia" ? user.id : null,
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

  revalidatePath("/academia/collaborations");
  redirect("/academia/collaborations");
}

export async function updateCollaborationAction(_prev: CollaborationActionState, formData: FormData): Promise<CollaborationActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const start_date = formData.get("start_date") as string || null;
  const end_date = formData.get("end_date") as string || null;
  const status = formData.get("status") as string;
  const participants = formData.get("participants") ? Number(formData.get("participants")) : null;
  const outcomes = formData.get("outcomes") as string || null;

  const { data: collab } = await supabase.from("industry_collaborations").select("*").eq("id", id).single();
  if (!collab) return { error: "Collaboration not found" };

  const canUpdate = collab.institution_id === user.id || collab.academician_id === user.id;
  if (!canUpdate) {
    const { data: membership } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("company_id", collab.company_id)
      .single();
    if (!membership) return { error: "Not authorized to update this collaboration" };
  }

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

  revalidatePath("/academia/collaborations");
  redirect("/academia/collaborations");
}

export async function deleteCollaborationAction(_prev: CollaborationActionState, formData: FormData): Promise<CollaborationActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { data: collab } = await supabase.from("industry_collaborations").select("*").eq("id", id).single();
  if (!collab) return { error: "Collaboration not found" };

  const canDelete = collab.institution_id === user.id || collab.academician_id === user.id;
  if (!canDelete) {
    const { data: membership } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("company_id", collab.company_id)
      .single();
    if (!membership) return { error: "Not authorized to delete this collaboration" };
  }

  const { error } = await supabase.from("industry_collaborations").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/academia/collaborations");
  redirect("/academia/collaborations");
}
