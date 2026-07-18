"use client";

import React from "react";
import { useFinance } from "@/context/FinanceContext";
import { DownloadIcon } from "@/icons";

const MONTHS = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" }));

export default function YearlyReportPage() {
  const { transactions, loading } = useFinance();
  const currentYear = new Date().getFullYear();
  const yearTransactions = transactions.filter(t => new Date(t.date).getFullYear() === currentYear);
  const income = yearTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = yearTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  const handleExportJSON = () => {
    const reportData = {
      report: "Yearly Report",
      year: currentYear,
      generated: new Date().toISOString(),
      totalIncome: income,
      totalExpenses: expenses,
      netSavings: net,
      monthlyBreakdown: Array.from({ length: 12 }, (_, i) => {
        const mt = yearTransactions.filter(t => new Date(t.date).getMonth() === i);
        return {
          month: MONTHS[i],
          income: mt.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
          expenses: mt.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      }),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yearly-report-${currentYear}.json`;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Yearly Report</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Full year {currentYear} financial overview</p>
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Monthly Breakdown</h3>
        {yearTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No transactions recorded for {currentYear}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 12 }, (_, i) => {
              const monthTxns = yearTransactions.filter(t => new Date(t.date).getMonth() === i);
              const monthIncome = monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
              const monthExpenses = monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
              return (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{MONTHS[i]}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-success-600">{monthIncome > 0 ? `+₱${monthIncome.toLocaleString()}` : "₱0"}</span>
                    <span className="text-error-600">{monthExpenses > 0 ? `-₱${monthExpenses.toLocaleString()}` : "₱0"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
