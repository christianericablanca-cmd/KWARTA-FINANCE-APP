"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useRouter } from "next/navigation";
import CurrencyInput from "@/components/form/CurrencyInput";

export const dynamic = 'force-dynamic';

export default function AddAccountPage() {
  const { addAccount } = useFinance();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank" as "cash" | "bank" | "savings" | "credit_card" | "ewallet" | "investment" | "crypto",
    balance: 0,
    availableBalance: 0,
    currency: "₱",
    institution: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addAccount(formData);
      router.push("/accounts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Add Account</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Create a new account</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
        {error && (
          <div className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
          <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as typeof formData.type })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90">
            <option value="cash">Cash</option>
            <option value="bank">Bank Account</option>
            <option value="savings">Savings</option>
            <option value="credit_card">Credit Card</option>
            <option value="ewallet">E-wallet</option>
            <option value="investment">Investment</option>
            <option value="crypto">Cryptocurrency</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
          <input type="text" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Balance</label>
            <CurrencyInput value={formData.balance} onChange={(val) => setFormData({ ...formData, balance: val, availableBalance: val })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available</label>
            <CurrencyInput value={formData.availableBalance} onChange={(val) => setFormData({ ...formData, availableBalance: val })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" min={0} />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Spendable now — auto-fills to match balance</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
          <input type="text" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? "Saving..." : "Add Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
