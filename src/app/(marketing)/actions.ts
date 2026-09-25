"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());

export async function joinWaitlist(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) redirect("/thank-you?for=waitlist");
  const parsed = z.object({
    full_name: z.string().trim().min(2).max(100),
    email,
    role: z.enum(["student", "parent", "academia", "industry", "other"]),
    consent: z.literal("on"),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please complete every field with valid details." };
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("waitlist_signups").insert({ ...parsed.data, consent: true });
  if (dbError && dbError.code !== "23505") return { error: "We could not save your place. Please try again." };
  redirect("/thank-you?for=waitlist");
}

export async function sendContactMessage(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) redirect("/thank-you?for=contact");
  const parsed = z.object({
    name: z.string().trim().min(2).max(100),
    email,
    subject: z.string().trim().min(3).max(150),
    message: z.string().trim().min(10).max(3000),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check your details and write at least 10 characters." };
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("contact_messages").insert(parsed.data);
  if (dbError) return { error: "Your message could not be sent. Please try again." };
  redirect("/thank-you?for=contact");
}

export async function submitReview(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("website")) redirect("/thank-you?for=review");
  const parsed = z.object({
    reviewer_name: z.string().trim().min(2).max(100),
    reviewer_role: z.string().trim().min(2).max(100),
    rating: z.coerce.number().int().min(1).max(5),
    review: z.string().trim().min(20).max(1200),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Add your role, a rating, and a review of at least 20 characters." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in before submitting a verified review." };
  const { error: dbError } = await supabase.from("reviews").insert({ ...parsed.data, user_id: user.id });
  if (dbError) return { error: "Your review could not be submitted. Please try again." };
  redirect("/thank-you?for=review");
}
