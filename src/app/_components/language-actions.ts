"use server";

import { createClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/lib/i18n";

export async function saveLanguagePreference(locale: AppLocale) {
  if (!(["en", "hi", "mr"] as const).includes(locale)) return { ok: false };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const [profileResult, notificationResult] = await Promise.all([
    supabase.from("profiles").update({ preferred_locale: locale }).eq("id", user.id),
    supabase.from("notification_preferences").upsert({ user_id: user.id, preferred_locale: locale }, { onConflict: "user_id" }),
  ]);
  return { ok: !profileResult.error && !notificationResult.error };
}
