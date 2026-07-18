"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import CurrencyInput from "@/components/form/CurrencyInput";
import { SearchIcon } from "@/icons";
import Link from "next/link";

export default function SearchPage() {
  const { transactions, accounts, categories, loading } = useFinance();
  const [rawQuery, setRawQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [amountRange, setAmountRange] = useState<[number, number]>([0, Infinity]);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 300);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const hasActiveFilters =
    debouncedQuery.trim().length > 0 ||
    amountRange[0] > 0 ||
    amountRange[1] < Infinity ||
    !!dateRange.start ||
    !!dateRange.end;

  const results = useMemo(() => {
    if (!hasActiveFilters) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return transactions.filter(txn => {
      const category = categories.find(c => c.id === txn.categoryId);
      const account = accounts.find(a => a.id === txn.accountId);
      const matchesQuery =
        !q ||
        txn.notes.toLowerCase().includes(q) ||
        (category?.name || "").toLowerCase().includes(q) ||
        (account?.name || "").toLowerCase().includes(q);
      const matchesAmount = txn.amount >= amountRange[0] && txn.amount <= amountRange[1];
      const matchesDate =
        (!dateRange.start || txn.date >= dateRange.start) &&
        (!dateRange.end || txn.date <= dateRange.end);
      return matchesQuery && matchesAmount && matchesDate;
    });
  }, [transactions, accounts, categories, debouncedQuery, amountRange, dateRange, hasActiveFilters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Search</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Find transactions, accounts, and bills</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by merchant, notes, category, or account..."
            value={rawQuery}
            onChange={e => setRawQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Amount</label>
            <CurrencyInput
              value={amountRange[0]}
              onChange={(val) => setAmountRange([val, amountRange[1]])}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Amount</label>
            <CurrencyInput
              value={amountRange[1] === Infinity ? 0 : amountRange[1]}
              onChange={(val) => setAmountRange([amountRange[0], val || Infinity])}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start || ""}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end || ""}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {!hasActiveFilters ? (
          <div className="text-center py-16">
            <SearchIcon className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Enter a search term or set filters to find transactions</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No results found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">{results.length} results found</p>
            {results.map(txn => {
              const category = categories.find(c => c.id === txn.categoryId);
              const account = accounts.find(a => a.id === txn.accountId);
              return (
                <Link
                  key={txn.id}
                  href={`/transactions`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{txn.notes}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category?.name} • {account?.name} • {txn.date}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${txn.type === "income" ? "text-success-600" : "text-error-600"}`}>
                      {txn.type === "income" ? "+" : "-"}₱{txn.amount.toLocaleString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
