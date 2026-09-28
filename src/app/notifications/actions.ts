"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveNotificationPreferences(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    in_app_enabled: formData.get("in_app_enabled") === "on",
    email_enabled: formData.get("email_enabled") === "on",
    match_alerts: formData.get("match_alerts") === "on",
    application_alerts: formData.get("application_alerts") === "on",
    deadline_alerts: formData.get("deadline_alerts") === "on",
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/notifications");
}
