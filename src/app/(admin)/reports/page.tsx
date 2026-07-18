"use client";

import React from "react";
import { useFinance } from "@/context/FinanceContext";
import { DownloadIcon, FileIcon } from "@/icons";
import Link from "next/link";

const REPORT_ROUTES: Record<string, string> = {
  "Monthly Report": "/reports/monthly",
  "Yearly Report": "/reports/yearly",
};

export default function ReportsPage() {
  const { loading } = useFinance();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  const reports = [
    { title: "Monthly Report", desc: "Summary of income, expenses, and net savings for the month" },
    { title: "Yearly Report", desc: "Complete financial overview for the entire year" },
    { title: "Income Statement", desc: "Detailed breakdown of all income sources" },
    { title: "Expense Report", desc: "Comprehensive expense analysis by category" },
    { title: "Category Report", desc: "Spending patterns across all categories" },
    { title: "Account Statement", desc: "Transaction history for each account" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Reports</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Generate and export financial reports</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, idx) => {
          const route = REPORT_ROUTES[report.title];
          const cardContent = (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <FileIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{report.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{report.desc}</p>
              <span className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 text-sm font-medium">
                <DownloadIcon className="w-4 h-4" /> Generate Report
              </span>
            </>
          );

          if (route) {
            return (
              <Link key={idx} href={route} className="block rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors">
                {cardContent}
              </Link>
            );
          }

          return (
            <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              {cardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
