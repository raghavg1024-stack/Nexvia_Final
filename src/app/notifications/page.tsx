import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Bell, Check, X, Mail, Briefcase, Star, MessageSquare, Award, Clock, AlertCircle } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } from "@/lib/notifications";
import type { Notification } from "@/lib/notifications";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  application_status: Briefcase,
  streak_reminder: Star,
  weekly_recap: Mail,
  system: AlertCircle,
};

export default async function NotificationsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(50),
    getUnreadCount(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-200">Notifications</h1>
          <p className="mt-1 text-slate-400">Stay updated on your applications and activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={async () => {
              const res = await markAllNotificationsRead();
              if (res.ok) window.location.reload();
            }}
            className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/20"
          >
            <Check className="h-4 w-4 mr-1" /> Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-card p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-slate-500" />
          <h2 className="mt-4 text-lg font-semibold text-slate-300">No notifications yet</h2>
          <p className="mt-2 text-sm text-slate-500">You&apos;ll see updates here when your application status changes or you have streak reminders.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} onRead={markNotificationRead} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notification, onRead }: { notification: Notification; onRead: (id: string) => Promise<{ ok: boolean } | { error: string }> }) {
  const [read, setRead] = React.useState(notification.read);
  const Icon = ICONS[notification.type] || Bell;

  const handleRead = async () => {
    if (read) return;
    const res = await onRead(notification.id);
    if (res.ok) setRead(true);
  };

  return (
    <div className={`rounded-xl border p-4 transition-colors ${read ? "border-line bg-card" : "border-amber-500/30 bg-amber-500/5 ring-1 ring-amber-500/10"}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getTypeColor(notification.type)}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-slate-200">{notification.title}</h3>
            <span className="shrink-0 text-xs text-slate-500">
              {new Date(notification.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{notification.message}</p>
          {notification.data?.job_title && (
            <p className="mt-2 text-xs text-slate-500">Job: {notification.data.job_title}</p>
          )}
          {!read && (
            <button
              onClick={handleRead}
              className="mt-3 text-xs font-medium text-accent hover:underline"
            >
              Mark as read
            </button>
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
    default: return "bg-slate-500/10 text-slate-500";
  }
}