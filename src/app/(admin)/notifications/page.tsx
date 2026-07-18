"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { BellIcon, CheckCircleIcon, InfoIcon, AlertIcon, ErrorIcon } from "@/icons";

const TYPE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  success: CheckCircleIcon,
  warning: AlertIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const TYPE_COLORS: Record<string, string> = {
  info: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
  success: "text-success-500 bg-success-50 dark:bg-success-500/15",
  warning: "text-warning-500 bg-warning-50 dark:bg-warning-500/15",
  error: "text-error-500 bg-error-50 dark:bg-error-500/15",
};

function safeLocaleString(time: string): string {
  try {
    const d = new Date(time);
    if (isNaN(d.getTime())) return time;
    return d.toLocaleString();
  } catch {
    return time;
  }
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, loading } = useFinance();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter(n => filter === "all" ? true : !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Notifications</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{unreadCount} unread notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {["all", "unread"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as "all" | "unread")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              >
                {f === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 text-brand-600 text-sm font-medium hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <BellIcon className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">All caught up!</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">No notifications to display</p>
          </div>
        ) : (
          filteredNotifications.map(notification => {
            const IconComponent = TYPE_ICONS[notification.type] || InfoIcon;
            const colorClass = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
            return (
              <div
                key={notification.id}
                onClick={() => handleMarkRead(notification.id)}
                className={`rounded-2xl border p-5 cursor-pointer transition-colors ${notification.read ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]" : "border-brand-200 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5"}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colorClass}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{notification.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{safeLocaleString(notification.time)}</p>
                  </div>
                  {!notification.read && <span className="w-2 h-2 rounded-full bg-brand-500 mt-2 flex-shrink-0"></span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
