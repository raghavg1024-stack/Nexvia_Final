"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPortalKey, PORTALS, type PortalKey } from "@/lib/portal-auth";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string | null;
  success?: string | null;
  step?: "credentials" | "otp";
  email?: string;
};

const LOGIN_OTP_COOKIE = "login_otp_challenge";
const LOGIN_OTP_MAX_AGE = 60 * 10;

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
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

async function readLoginChallenge(): Promise<{
  email: string;
  portal: PortalKey;
} | null> {
  const raw = (await cookies()).get(LOGIN_OTP_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: unknown; portal?: unknown };
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.portal !== "string" ||
      !isPortalKey(parsed.portal)
    ) {
      return null;
    }
    return { email: parsed.email, portal: parsed.portal };
  } catch {
    return null;
  }
}

function getOtpErrorMessage(code?: string, status?: number) {
  if (code === "email_address_not_authorized") {
    return "Email delivery is not configured for this address. Please use your password or contact support.";
  }
  if (code === "otp_disabled") {
    return "Email-code sign in is currently unavailable. Please use your password.";
  }
  if (code === "over_email_send_rate_limit" || status === 429) {
    return "A code was requested recently. Wait about a minute, then try again.";
  }
  return "We could not send a sign-in email. Please use your password or try again shortly.";
}

async function sendLoginOtp(email: string, portal: PortalKey): Promise<AuthState> {
  const supabase = await createClient();
  const destination = PORTALS[portal].destination;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${await getOrigin()}/auth/callback?next=${encodeURIComponent(destination)}`,
    },
  });

  if (error) {
    return { error: getOtpErrorMessage(error.code, error.status) };
  }

  (await cookies()).set(LOGIN_OTP_COOKIE, JSON.stringify({ email, portal }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LOGIN_OTP_MAX_AGE,
  });

  return {
    step: "otp",
    email,
    success: "Your secure sign-in email is on its way.",
  };
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

  const allowed = await hasPortalAccess(supabase, portal, data.user.id);
  if (!allowed) {
    await supabase.auth.signOut();
    return { error: `This account is not registered for the ${PORTALS[portal].label} Portal. Please choose the correct portal.` };
  }

  (await cookies()).delete(LOGIN_OTP_COOKIE);
  redirect(PORTALS[portal].destination);
}

export async function requestLoginOtp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawPortal = String(formData.get("portal") ?? "student");
  const portal: PortalKey = isPortalKey(rawPortal) ? rawPortal : "student";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter the email address linked to your Nexvia account." };
  }

  return sendLoginOtp(email, portal);
}

export async function verifyLoginOtp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const challenge = await readLoginChallenge();
  if (!challenge) {
    return { error: "Your verification session expired. Please sign in again." };
  }

  const token = String(formData.get("otp") ?? "").replace(/\D/g, "");
  if (token.length !== 6) {
    return { step: "otp", email: challenge.email, error: "Enter the 6-digit code from your email." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email: challenge.email,
    token,
    type: "email",
  });

  if (error || !data.session || !data.user) {
    return {
      step: "otp",
      email: challenge.email,
      error: error?.code === "otp_expired"
        ? "That code has expired. Request a fresh code and try again."
        : "That code does not match. Check the six digits and try again.",
    };
  }

  const allowed = await hasPortalAccess(supabase, challenge.portal, data.user.id);
  if (!allowed) {
    await supabase.auth.signOut();
    (await cookies()).delete(LOGIN_OTP_COOKIE);
    return { error: `This account is not registered for the ${PORTALS[challenge.portal].label} Portal. Please choose the correct portal.` };
  }

  (await cookies()).delete(LOGIN_OTP_COOKIE);
  redirect(PORTALS[challenge.portal].destination);
}

export async function resendLoginOtp(
  _prevState: AuthState,
  _formData: FormData
): Promise<AuthState> {
  void _prevState;
  void _formData;
  const challenge = await readLoginChallenge();
  if (!challenge) {
    return { error: "Your verification session expired. Please sign in again." };
  }

  const result = await sendLoginOtp(challenge.email, challenge.portal);
  return result.error
    ? { ...result, step: "otp", email: challenge.email }
    : { ...result, success: "A fresh sign-in email is on its way." };
}

export async function cancelLoginOtp(): Promise<void> {
  const challenge = await readLoginChallenge();
  (await cookies()).delete(LOGIN_OTP_COOKIE);
  redirect(challenge ? `/login/${challenge.portal}` : "/login");
}
