"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/FinanceContext";
import { createClient } from "@/lib/supabase/client";
import { UserCircleIcon, WalletIcon } from "@/icons";

export default function ProfilePage() {
  const { accounts, transactions, profile, loading } = useFinance();
  const router = useRouter();
  const supabase = createClient();
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalTransactions = transactions.length;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const displayName = profile?.fullName || "User";
  const email = profile?.email || "";

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Profile</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Profile</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your account overview</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 mx-auto mb-4">
            <UserCircleIcon className="w-12 h-12 text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{displayName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
            <span>₱</span>
            <span>PHP</span>
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="text-brand-500 w-5 h-5" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Balance</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">₱{totalBalance.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Accounts</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{accounts.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{totalTransactions}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Currency</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">₱ PHP</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-6 w-full py-3 rounded-xl border border-error-200 bg-error-50 text-error-600 font-medium text-sm hover:bg-error-100 dark:border-error-800 dark:bg-error-500/10 dark:text-error-400 dark:hover:bg-error-500/20 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
