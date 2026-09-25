import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

type ParentLink = {
  id: string;
  student_user_id: string;
  parent_phone: string;
};

type OverdueTask = {
  id: string;
  title: string;
  due_at: string;
  careerTitle: string;
};

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[character] ?? character);
}

async function createSupportiveMessage(studentName: string, task: OverdueTask) {
  const firstName = studentName.trim().split(" ")[0] || "your learner";
  const days = Math.max(1, Math.floor((Date.now() - new Date(task.due_at).getTime()) / 86_400_000));
  const fallback = `Hello. This is a supportive progress update from Nexvia. ${firstName}'s roadmap activity, ${task.title}, is ${days} day${days === 1 ? "" : "s"} overdue. Please check in calmly and help them plan a small next step. This is not an emergency or a disciplinary alert.`;
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) return fallback;

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      system: "Write a calm, non-judgmental automated phone message for a parent. Never shame, threaten, diagnose, or claim an emergency. Use only the supplied facts. Keep it under 65 words and end with one supportive action.",
      prompt: `Student first name: ${firstName}\nCareer path: ${task.careerTitle}\nOverdue task: ${task.title}\nDays overdue: ${days}`,
    });
    return text.trim().slice(0, 700) || fallback;
  } catch {
    return fallback;
  }
}

async function placeTwilioCall(phone: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !from) throw new Error("Twilio is not configured");

  const body = new URLSearchParams({
    To: phone,
    From: from,
    Twiml: `<Response><Say language="en-IN">${escapeXml(message)}</Say></Response>`,
  });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const result = await response.json() as { sid?: string; message?: string };
  if (!response.ok || !result.sid) throw new Error(result.message ?? "Calling provider rejected the request");
  return result.sid;
}

async function findOverdueTasks(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
): Promise<OverdueTask[]> {
  const { data: roadmaps } = await admin
    .from("roadmaps")
    .select("id, career_title")
    .eq("user_id", studentId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);
  const roadmap = roadmaps?.[0];
  if (!roadmap) return [];

  const { data: milestones } = await admin.from("milestones").select("id").eq("roadmap_id", roadmap.id);
  const milestoneIds = (milestones ?? []).map((item) => item.id);
  if (milestoneIds.length === 0) return [];

  const { data: courses } = await admin
    .from("courses")
    .select("id, title, due_at")
    .in("milestone_id", milestoneIds)
    .eq("status", "in_progress")
    .lt("due_at", new Date().toISOString())
    .order("due_at", { ascending: true })
    .limit(10);
  return (courses ?? [])
    .filter((course): course is typeof course & { due_at: string } => Boolean(course.due_at))
    .map((course) => ({ id: course.id, title: course.title, due_at: course.due_at, careerTitle: roadmap.career_title }));
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    return Response.json({ ok: false, error: "Calling provider is not configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  const { data: rawLinks, error } = await admin
    .from("parent_links")
    .select("id, student_user_id, parent_phone")
    .eq("status", "active")
    .eq("overdue_call_enabled", true)
    .not("student_call_consent_at", "is", null)
    .not("parent_call_consent_at", "is", null)
    .not("parent_phone", "is", null)
    .limit(25);
  if (error) return Response.json({ ok: false, error: "Could not load notification preferences" }, { status: 500 });

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const link of (rawLinks ?? []) as ParentLink[]) {
    const tasks = await findOverdueTasks(admin, link.student_user_id);
    if (tasks.length === 0) {
      skipped += 1;
      continue;
    }

    let task: OverdueTask | null = null;
    let reusableAlertId: string | null = null;
    for (const candidate of tasks) {
      const { data: existing } = await admin
        .from("parent_alerts")
        .select("id, status, attempt_count, attempted_at")
        .eq("parent_link_id", link.id)
        .eq("course_id", candidate.id)
        .eq("alert_kind", "overdue_course")
        .maybeSingle();
      if (!existing) {
        task = candidate;
        break;
      }
      const retryReady = existing.status === "failed"
        && existing.attempt_count < 3
        && new Date(existing.attempted_at).getTime() < Date.now() - 86_400_000;
      if (retryReady) {
        task = candidate;
        reusableAlertId = existing.id;
        break;
      }
    }
    if (!task) {
      skipped += 1;
      continue;
    }

    const { data: profile } = await admin.from("profiles").select("full_name").eq("id", link.student_user_id).maybeSingle();
    const message = await createSupportiveMessage(profile?.full_name ?? "Learner", task);
    const alertResult = reusableAlertId
      ? await admin
          .from("parent_alerts")
          .update({ status: "processing", message, attempted_at: new Date().toISOString(), error_message: null })
          .eq("id", reusableAlertId)
          .eq("status", "failed")
          .lt("attempt_count", 3)
          .select("id, attempt_count")
          .single()
      : await admin
          .from("parent_alerts")
          .insert({ parent_link_id: link.id, student_user_id: link.student_user_id, course_id: task.id, message })
          .select("id, attempt_count")
          .single();
    const alert = alertResult.data;
    const alertError = alertResult.error;
    if (alertError || !alert) {
      skipped += 1;
      continue;
    }
    if (reusableAlertId) {
      await admin.from("parent_alerts").update({ attempt_count: alert.attempt_count + 1 }).eq("id", alert.id);
    }

    try {
      const callId = await placeTwilioCall(link.parent_phone, message);
      await admin.from("parent_alerts").update({ status: "sent", provider_call_id: callId, completed_at: new Date().toISOString() }).eq("id", alert.id);
      sent += 1;
    } catch (callError) {
      await admin.from("parent_alerts").update({ status: "failed", error_message: callError instanceof Error ? callError.message.slice(0, 400) : "Unknown calling error", completed_at: new Date().toISOString() }).eq("id", alert.id);
      failed += 1;
    }
  }

  return Response.json({ ok: true, checked: rawLinks?.length ?? 0, sent, skipped, failed });
}
