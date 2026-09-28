import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

async function enqueueDeadlineAlerts() {
  const admin = createAdminClient();
  const today = new Date();
  const until = new Date(today.getTime() + 7 * 86_400_000);
  const day = (value: Date) => value.toISOString().slice(0, 10);
  const { data: jobs } = await admin.from("jobs").select("id,title,application_deadline").eq("moderation_status", "approved").eq("status", "open").gte("application_deadline", day(today)).lte("application_deadline", day(until));
  let queued = 0;
  for (const job of jobs ?? []) {
    const { data: applications } = await admin.from("job_applications").select("user_id").eq("job_id", job.id).in("status", ["pending", "reviewed"]);
    const notifications = (applications ?? []).map((application) => ({
      user_id: application.user_id, type: "deadline", title: "Application deadline approaching",
      message: `${job.title} closes on ${new Date(`${job.application_deadline}T00:00:00`).toLocaleDateString("en-IN")}. Review your application status and next steps.`,
      data: { job_id: job.id, deadline: job.application_deadline }, dedupe_key: `deadline:${job.id}:${job.application_deadline}`,
    }));
    if (notifications.length) {
      const { error } = await admin.from("notifications").upsert(notifications, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });
      if (!error) queued += notifications.length;
    }
  }
  return queued;
}

async function deliverEmailOutbox() {
  const admin = createAdminClient();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NEXVIA_EMAIL_FROM;
  if (!apiKey || !from) return { sent: 0, skipped: true };
  const { data: messages } = await admin.from("email_outbox").select("*").in("status", ["pending", "failed"]).lt("attempts", 5).lte("next_attempt_at", new Date().toISOString()).order("created_at").limit(50);
  let sent = 0;
  for (const message of messages ?? []) {
    await admin.from("email_outbox").update({ status: "processing", attempts: message.attempts + 1 }).eq("id", message.id);
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `nexvia-${message.notification_id}` },
        body: JSON.stringify({ from, to: [message.recipient_email], subject: message.subject, html: message.html_body }),
      });
      const result = await response.json() as { id?: string; message?: string };
      if (!response.ok || !result.id) throw new Error(result.message ?? "Email provider rejected the message.");
      await admin.from("email_outbox").update({ status: "sent", provider_id: result.id, sent_at: new Date().toISOString(), last_error: null }).eq("id", message.id);
      sent += 1;
    } catch (error) {
      const delayMinutes = Math.min(360, 2 ** (message.attempts + 1) * 5);
      await admin.from("email_outbox").update({ status: "failed", last_error: error instanceof Error ? error.message.slice(0, 500) : "Unknown email error", next_attempt_at: new Date(Date.now() + delayMinutes * 60_000).toISOString() }).eq("id", message.id);
    }
  }
  return { sent, skipped: false };
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const queued = await enqueueDeadlineAlerts();
  const delivery = await deliverEmailOutbox();
  return NextResponse.json({ ok: true, deadlineNotificationsQueued: queued, ...delivery });
}
