import type { ComponentType } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Bell, Check, Mail, Briefcase, Star, AlertCircle, Clock3, ShieldCheck, BookOpenCheck, Sparkles } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } from "@/lib/notifications";
import type { Notification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";
import { saveNotificationPreferences } from "./actions";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  application_status: Briefcase,
  streak_reminder: Star,
  weekly_recap: Mail,
  system: AlertCircle,
  match: Sparkles,
  deadline: Clock3,
  verification: ShieldCheck,
  training: BookOpenCheck,
};

export default async function NotificationsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [notifications, unreadCount, preferenceResult] = await Promise.all([
    getNotifications(50),
    getUnreadCount(),
    supabase.from("notification_preferences").select("*").eq("user_id", profile.id).maybeSingle(),
  ]);
  const preferences = preferenceResult.data;

  async function markAllReadAction() {
    "use server";
    await markAllNotificationsRead();
    revalidatePath("/notifications");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="mt-1 text-slate-400">Stay updated on your applications and activity</p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllReadAction}>
            <button type="submit" className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/20">
              <Check className="h-4 w-4 mr-1" /> Mark all read ({unreadCount})
            </button>
          </form>
        )}
      </div>

      <form action={saveNotificationPreferences} className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-500/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-foreground">Alert preferences</h2><p className="mt-1 text-sm text-slate-500">Email uses a retry-safe outbox; in-app alerts remain your activity record.</p></div><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Save preferences</button></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["in_app_enabled", "In-app"], ["email_enabled", "Email"], ["match_alerts", "Matches"], ["application_alerts", "Applications"], ["deadline_alerts", "Deadlines"]].map(([name, label]) => <label key={name} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"><input type="checkbox" name={name} defaultChecked={preferences ? Boolean(preferences[name]) : true} className="accent-blue-600" />{label}</label>)}</div>
      </form>

      {notifications.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-card p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-300">No notifications yet</h2>
          <p className="mt-2 text-sm text-slate-500">You&apos;ll see updates here when your application status changes or you have streak reminders.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  const Icon = ICONS[notification.type] || Bell;
  const jobTitle = typeof notification.data?.job_title === "string" ? notification.data.job_title : null;

  async function markReadAction() {
    "use server";
    await markNotificationRead(notification.id);
    revalidatePath("/notifications");
  }

  return (
    <div className={`rounded-xl border p-4 transition-colors ${notification.read ? "border-line bg-card" : "border-amber-500/30 bg-amber-500/5 ring-1 ring-amber-500/10"}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getTypeColor(notification.type)}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground">{notification.title}</h3>
            <span className="shrink-0 text-xs text-slate-500">
              {new Date(notification.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
          {jobTitle && (
            <p className="mt-2 text-xs text-slate-500">Job: {jobTitle}</p>
          )}
          {!notification.read && (
            <form action={markReadAction}>
              <button type="submit" className="mt-3 text-xs font-medium text-accent hover:underline">
                Mark as read
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case "application_status": return "bg-blue-500/10 text-blue-500";
    case "streak_reminder": return "bg-amber-500/10 text-amber-500";
    case "weekly_recap": return "bg-violet-500/10 text-violet-500";
    case "system": return "bg-slate-500/10 text-slate-500";
    case "match": return "bg-violet-500/10 text-violet-500";
    case "deadline": return "bg-amber-500/10 text-amber-500";
    case "verification": return "bg-emerald-500/10 text-emerald-500";
    case "training": return "bg-blue-500/10 text-blue-500";
    default: return "bg-slate-500/10 text-slate-500";
  }
}
