"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";

export default function AnalyticsIncomePage() {
  const { transactions, categories, loading } = useFinance();

  const incomeByCategory = useMemo(
    () => categories
      .filter(c => c.type === "income")
      .map(c => ({
        name: c.name,
        value: transactions.filter(t => t.categoryId === c.id && t.type === "income").reduce((s, t) => s + t.amount, 0),
        count: transactions.filter(t => t.categoryId === c.id && t.type === "income").length,
      }))
      .filter(c => c.value > 0),
    [categories, transactions]
  );

  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const incomeCount = useMemo(
    () => transactions.filter(t => t.type === "income").length,
    [transactions]
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Income Analytics</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze your income sources and trends</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">₱{totalIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{incomeCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average per Transaction</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white/90">₱{incomeCount ? Math.round(totalIncome / incomeCount).toLocaleString() : 0}</p>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Income by Source</h3>
        {incomeByCategory.length > 0 ? (
          <div className="space-y-3">
            {incomeByCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">{cat.name}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">₱{cat.value.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 block">{cat.count} transactions</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">No income data yet</div>
        )}
      </div>
    </div>
  );
}
