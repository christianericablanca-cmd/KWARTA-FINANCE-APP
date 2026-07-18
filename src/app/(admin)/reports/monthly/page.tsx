"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { DownloadIcon } from "@/icons";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

const INITIAL_SHOW = 20;

export default function MonthlyReportPage() {
  const { transactions, loading } = useFinance();
  const [showCount, setShowCount] = useState(INITIAL_SHOW);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date + "T00:00:00");
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = monthTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  const handleExportJSON = () => {
    const reportData = {
      report: "Monthly Report",
      period: now.toLocaleString("default", { month: "long", year: "numeric" }),
      generated: new Date().toISOString(),
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: net,
      transactions: monthTransactions.map(t => ({
        id: t.id,
        notes: t.notes,
        date: t.date,
        amount: t.amount,
        type: t.type,
      })),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-report-${currentYear}-${String(currentMonth + 1).padStart(2, "0")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const visibleTransactions = monthTransactions.slice(0, showCount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Monthly Report</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{now.toLocaleString("default", { month: "long", year: "numeric" })}</p>
        </div>
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
        >
          <DownloadIcon className="w-5 h-5" />
          Export JSON
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
          <p className="text-2xl font-bold text-success-600">₱{income.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
          <p className="text-2xl font-bold text-error-600">₱{expenses.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Net Savings</p>
          <p className={`text-2xl font-bold ${net >= 0 ? "text-brand-600" : "text-error-600"}`}>₱{net.toLocaleString()}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Transaction Summary</h3>
        {monthTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No transactions recorded for this month.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map(txn => (
                    <tr key={txn.id} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-white/90">{txn.notes}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(txn.date)}</td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${txn.type === "income" ? "text-success-600" : "text-error-600"}`}>
                        {txn.type === "income" ? "+" : "-"}₱{txn.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showCount < monthTransactions.length && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowCount(prev => prev + INITIAL_SHOW)}
                  className="px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
                >
                  Show more ({monthTransactions.length - showCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
