"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { BellIcon } from "@/icons";

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markNotificationRead } = useFinance();
  const unreadCount = notifications.filter(n => !n.read).length;

  function toggleDropdown() {
    setIsOpen(prev => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const recentNotifications = notifications.slice(0, 8);

  const typeStyles: Record<string, string> = {
    info: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    success: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500",
    warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-orange-400",
    error: "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400",
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 z-10 flex items-center justify-center h-5 min-w-[20px] px-1 text-[10px] font-bold text-white bg-brand-500 rounded-full">
            {unreadCount}
          </span>
        )}
        <BellIcon className="w-5 h-5" />
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="fixed left-1/2 -translate-x-1/2 top-16 sm:absolute sm:translate-x-0 sm:right-0 sm:left-auto sm:top-auto mt-[17px] flex h-[420px] w-[calc(100vw-2rem)] max-w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          {unreadCount > 0 && (
            <span className="text-xs text-brand-500 font-medium">{unreadCount} new</span>
          )}
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {recentNotifications.length === 0 ? (
            <li>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BellIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">You're all caught up</p>
              </div>
            </li>
          ) : (
            recentNotifications.map(n => (
              <li key={n.id}>
                <button
                  onClick={() => { markNotificationRead(n.id); closeDropdown(); }}
                  className={`flex gap-3 rounded-lg p-3 w-full text-left hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!n.read ? "bg-gray-50 dark:bg-white/[0.02]" : ""}`}
                >
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${typeStyles[n.type] || typeStyles.info}`}>
                    <span className="text-xs font-bold">!</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.time)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2"></span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
        <Link
          href="/notifications"
          onClick={closeDropdown}
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
