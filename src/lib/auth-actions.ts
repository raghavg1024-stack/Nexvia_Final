"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPortalKey, PORTALS, type PortalKey } from "@/lib/portal-auth";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string | null;
  success?: string | null;
};

async function getOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (configuredOrigin) {
    try {
      const url = new URL(configuredOrigin);
      if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    } catch {}
  }

  const headersList = await headers();
  const host = headersList.get("host");
  if (!host) {
    throw new Error("The application URL is not configured. Set NEXT_PUBLIC_SITE_URL before sending authentication emails.");
  }
  const proto = headersList.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function hasPortalAccess(
  supabase: SupabaseClient,
  portal: PortalKey,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", userId)
    .maybeSingle();
  const userType = profile?.user_type ?? "student";

  const allowed =
    (portal === "student" && userType === "student") ||
    (portal === "industry" && userType === "recruiter") ||
    (portal === "academia" && userType === "academia") ||
    (portal === "parent" && userType === "parent");

  if (!allowed && portal === "parent") {
    const { data: link } = await supabase
      .from("parent_links")
      .select("id")
      .eq("parent_user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    return Boolean(link);
  }

  return allowed;
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
  let emailRedirectTo: string;
  try {
    emailRedirectTo = `${await getOrigin()}/auth/callback?next=${encodeURIComponent(portalConfig.signupDestination)}`;
  } catch {
    return { error: "The application URL is not configured for email confirmation. Please contact support." };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, account_type: portalConfig.accountType },
      emailRedirectTo,
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

  const allowed = await hasPortalAccess(supabase, portal, data.user.id);
  if (!allowed) {
    await supabase.auth.signOut();
    return { error: `This account is not registered for the ${PORTALS[portal].label} Portal. Please choose the correct portal.` };
  }

  redirect(PORTALS[portal].destination);
}
