"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string | null; success?: string | null };

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signup(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }
  if (!fullName) {
    return { error: "Please enter your full name." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  if (data.session && data.user) {
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: data.user.id, full_name: fullName, email }, { onConflict: "id" });
    if (upsertError) {
      console.warn("Profile upsert failed", upsertError.message);
    }
  }

  if (data.session) {
    redirect("/assessment");
  }

  return {
    error: null,
    success:
      "Account created. Check your email to confirm your signup before logging in.",
  };
}

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  redirect("/dashboard");
}
