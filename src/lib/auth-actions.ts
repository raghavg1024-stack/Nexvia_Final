"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPortalKey, PORTALS, type PortalKey } from "@/lib/portal-auth";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string | null; success?: string | null };

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const rawPortal = String(formData.get("portal") ?? "student");
  const portal: PortalKey = isPortalKey(rawPortal) ? rawPortal : "student";
  const portalConfig = PORTALS[portal];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters long." };
  if (!fullName) return { error: "Please enter your full name." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, account_type: portalConfig.accountType },
      emailRedirectTo: `${await getOrigin()}/auth/callback?next=${encodeURIComponent(portalConfig.signupDestination)}`,
    },
  });
  if (error) return { error: error.message };

  if (data.session && data.user) {
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        { id: data.user.id, full_name: fullName, email, user_type: portalConfig.accountType },
        { onConflict: "id" },
      );
    if (upsertError) return { error: "Your account was created, but its portal could not be prepared." };
    redirect(portalConfig.signupDestination);
  }

  return { error: null, success: "Account created. Check your email to confirm your signup before logging in." };
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rawPortal = String(formData.get("portal") ?? "student");
  const portal: PortalKey = isPortalKey(rawPortal) ? rawPortal : "student";
  if (!email || !password) return { error: "Please enter your email and password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  if (!data.user) return { error: "Your account could not be verified." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", data.user.id)
    .maybeSingle();
  const userType = profile?.user_type ?? "student";
  let allowed =
    (portal === "student" && userType === "student") ||
    (portal === "industry" && userType === "recruiter") ||
    (portal === "academia" && userType === "academia") ||
    (portal === "parent" && userType === "parent");

  if (portal === "parent" && !allowed) {
    const { data: link } = await supabase
      .from("parent_links")
      .select("id")
      .eq("parent_user_id", data.user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    allowed = Boolean(link);
  }

  if (!allowed) {
    await supabase.auth.signOut();
    return { error: `This account is not registered for the ${PORTALS[portal].label} Portal. Please choose the correct portal.` };
  }

  redirect(PORTALS[portal].destination);
}
