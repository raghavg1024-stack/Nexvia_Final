"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

interface NotificationBadgeProps {
  count: number;
  href?: string;
}

export function NotificationBadge({ count, href = "/notifications" }: NotificationBadgeProps) {
  if (count === 0) return null;
  
  return (
    <Link
      href={href}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}