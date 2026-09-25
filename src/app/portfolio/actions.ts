"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PortfolioItem } from "@/lib/types";

export type PortfolioActionState = { error?: string | null; ok?: boolean };

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("user_id", user.id)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return items as PortfolioItem[] || [];
}

export async function createPortfolioItemAction(
  _prevState: PortfolioActionState,
  formData: FormData
): Promise<PortfolioActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string || null;
  const skills = formData.get("skills") as string;
  const organization = formData.get("organization") as string || null;
  const location = formData.get("location") as string || null;
  const start_date = formData.get("start_date") as string || null;
  const end_date = formData.get("end_date") as string || null;
  const url = formData.get("url") as string || null;
  const image_url = formData.get("image_url") as string || null;
  const is_featured = formData.get("is_featured") === "on";
  const verification_status = formData.get("verification_status") as string || "self_reported";

  if (!title || !type) {
    return { error: "Title and type are required" };
  }

  let skillsArray: string[] = [];
  try {
    skillsArray = JSON.parse(skills || "[]");
  } catch {
    skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
  }

  const { data: existing } = await supabase
    .from("portfolio_items")
    .select("display_order")
    .eq("user_id", user.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const display_order = (existing?.display_order || 0) + 1;

  const { error } = await supabase.from("portfolio_items").insert({
    user_id: user.id,
    title,
    type,
    description,
    skills: skillsArray,
    organization,
    location,
    start_date,
    end_date,
    url,
    image_url,
    is_featured,
    verification_status,
    display_order,
  });

  if (error) return { error: error.message };

  revalidatePath("/portfolio");
  return { ok: true };
}

export async function updatePortfolioItemAction(
  _prevState: PortfolioActionState,
  formData: FormData
): Promise<PortfolioActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string || null;
  const skills = formData.get("skills") as string;
  const organization = formData.get("organization") as string || null;
  const location = formData.get("location") as string || null;
  const start_date = formData.get("start_date") as string || null;
  const end_date = formData.get("end_date") as string || null;
  const url = formData.get("url") as string || null;
  const image_url = formData.get("image_url") as string || null;
  const is_featured = formData.get("is_featured") === "on";
  const verification_status = formData.get("verification_status") as string || "self_reported";

  const { data: item } = await supabase.from("portfolio_items").select("user_id").eq("id", id).single();
  if (!item || item.user_id !== user.id) return { error: "Not authorized to update this item" };

  let skillsArray: string[] = [];
  try {
    skillsArray = JSON.parse(skills || "[]");
  } catch {
    skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
  }

  const { error } = await supabase.from("portfolio_items").update({
    title,
    type,
    description,
    skills: skillsArray,
    organization,
    location,
    start_date,
    end_date,
    url,
    image_url,
    is_featured,
    verification_status,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/portfolio");
  return { ok: true };
}

export async function deletePortfolioItemAction(
  _prevState: PortfolioActionState,
  formData: FormData
): Promise<PortfolioActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;

  const { data: item } = await supabase.from("portfolio_items").select("user_id").eq("id", id).single();
  if (!item || item.user_id !== user.id) return { error: "Not authorized to delete this item" };

  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/portfolio");
  return { ok: true };
}