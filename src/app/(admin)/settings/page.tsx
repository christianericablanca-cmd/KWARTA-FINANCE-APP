"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useTheme } from "@/context/ThemeContext";
import { GearIcon } from "@/icons";

function getNotificationPrefs() {
  if (typeof window === "undefined") return { budget: true, bills: true, goals: true };
  try {
    return JSON.parse(localStorage.getItem("kwarta_notifications") || "null") || { budget: true, bills: true, goals: true };
  } catch { return { budget: true, bills: true, goals: true }; }
}
function saveNotificationPrefs(prefs: Record<string, boolean>) {
  if (typeof window !== "undefined") localStorage.setItem("kwarta_notifications", JSON.stringify(prefs));
}

export default function SettingsPage() {
  const { profile, updateProfile, resetAllData, data, loading } = useFinance();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifPrefs, setNotifPrefs] = useState(getNotificationPrefs);

  const [localCurrency, setLocalCurrency] = useState(profile?.currency || "₱");
  const [localTheme, setLocalTheme] = useState(theme);

  const tabs = [
    { id: "general", label: "General" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "data", label: "Data Management" },
  ];

  const handleSaveCurrency = async () => {
    try {
      await updateProfile({ currency: localCurrency });
      showMessage("success", "Currency updated");
    } catch {
      showMessage("error", "Failed to save");
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setLocalTheme(newTheme as "light" | "dark");
    setTheme(newTheme as "light" | "dark");
    try {
      await updateProfile({ theme: newTheme });
      showMessage("success", "Theme updated");
    } catch {
      showMessage("error", "Failed to save theme");
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile,
      ...data,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kwarta-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage("success", "Data exported");
  };

  const handleReset = async () => {
    if (!confirm("This will permanently delete all your financial data. This cannot be undone. Continue?")) return;
    try {
      await resetAllData();
      showMessage("success", "All data has been reset");
    } catch {
      showMessage("error", "Failed to reset data");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-36 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-full rounded-2xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your app preferences</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-success-50 text-success-700 border border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/30"
            : "bg-error-50 text-error-700 border border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/30"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-b-2 border-brand-500 text-brand-600" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        {activeTab === "general" && (
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Currency</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localCurrency}
                  onChange={e => setLocalCurrency(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                />
                <button
                  onClick={handleSaveCurrency}
                  className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
              <div className="flex gap-2">
                {[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleThemeChange(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      localTheme === opt.value
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4 max-w-xl">
            {[
              { key: "budget", title: "Budget Alerts", desc: "Get notified when you exceed budget" },
              { key: "bills", title: "Bill Reminders", desc: "Remind me before bills are due" },
              { key: "goals", title: "Goal Milestones", desc: "Notify when savings goals are reached" },
            ].map(item => (
              <label key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs[item.key]}
                  onChange={() => {
                    const updated = { ...notifPrefs, [item.key]: !notifPrefs[item.key] };
                    setNotifPrefs(updated);
                    saveNotificationPrefs(updated);
                  }}
                  className="rounded border-gray-300 w-5 h-5"
                />
              </label>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-4 max-w-xl">
            <div className="p-4 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/30">
              <p className="text-sm text-success-700 dark:text-success-400">
                Your data is securely stored in Supabase with row-level security (RLS). Only you can access your financial data.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Authentication</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                You are logged in as <strong>{profile?.email || "unknown"}</strong>. Password and account management is handled securely by Supabase Auth.
              </p>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-4 max-w-xl">
            <div>
              <h3 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-2">Export Data</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Export all your data as a JSON file</p>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 text-sm transition-colors"
              >
                Export JSON
              </button>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-error-600 mb-2">Danger Zone</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Permanently delete all your accounts, transactions, budgets, goals, bills, and categories. Your account and profile will remain.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-error-50 text-error-600 rounded-lg hover:bg-error-100 dark:bg-error-500/10 dark:text-error-400 text-sm transition-colors"
              >
                Reset All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
