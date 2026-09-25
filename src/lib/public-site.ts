import { createClient } from "@/lib/supabase/server";

export type PublicReview = {
  id: string;
  reviewer_name: string;
  reviewer_role: string;
  rating: number;
  review: string;
  created_at: string;
};

export async function getApprovedReviews(limit = 6): Promise<PublicReview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, reviewer_name, reviewer_role, rating, review, created_at")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
