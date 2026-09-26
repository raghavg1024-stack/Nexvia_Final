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

function otpDeliveryError(error: { code?: string; message: string; status?: number }) {
  if (error.code === "over_email_send_rate_limit" || error.status === 429) {
    return "Too many codes were requested. Please wait a minute before trying again.";
  }
  if (error.code === "email_address_not_authorized") {
    return "This email service is not configured to deliver verification codes to this address. Please contact support.";
  }
  if (error.code === "otp_disabled") {
    return "Email verification is disabled for this project. Please contact support.";
  }
  return "We could not send a verification code. Please try again shortly.";
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

  await supabase.auth.signOut();

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });
  if (otpError) {
    console.error("[auth:otp-send] Supabase rejected verification-code delivery", {
      code: otpError.code,
      status: otpError.status,
    });
    return { error: otpDeliveryError(otpError) };
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
    success: `We sent a 6-digit verification code to ${email}. It expires in 10 minutes.`,
  };
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
    if (error) {
      console.error("[auth:otp-verify] Supabase rejected verification code", {
        code: error.code,
        status: error.status,
      });
    }
    return {
      step: "otp",
      email: challenge.email,
      error: "That code is invalid or has expired. Request a new code and try again.",
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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: challenge.email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    console.error("[auth:otp-resend] Supabase rejected verification-code delivery", {
      code: error.code,
      status: error.status,
    });
    return {
      step: "otp",
      email: challenge.email,
      error: otpDeliveryError(error),
    };
  }

  return {
    step: "otp",
    email: challenge.email,
    success: "A new verification code is on its way. Check your inbox.",
  };
}

export async function cancelLoginOtp(): Promise<void> {
  (await cookies()).delete(LOGIN_OTP_COOKIE);
  redirect("/login");
}
