"use client";

import React, { useState, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import CurrencyInput from "@/components/form/CurrencyInput";
import {
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  SearchIcon,
  CloseIcon,
} from "@/icons";
import { Transaction } from "@/lib/types";

export default function TransactionsPage() {
  const { transactions, accounts, categories, loading, addTransaction, updateTransaction, deleteTransaction, deleteTransactions } = useFinance();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    categoryId: "",
    accountId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    tags: [] as string[],
    type: "expense" as Transaction["type"],
  });

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter(txn => {
      const matchesSearch = txn.notes.toLowerCase().includes(search.toLowerCase()) ||
        categories.find(c => c.id === txn.categoryId)?.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || txn.type === filterType;
      const matchesCategory = filterCategory === "all" || txn.categoryId === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [sortedTransactions, search, filterType, filterCategory, categories]);

  const openAddModal = () => {
    setError(null);
    setEditingTransaction(null);
    setFormData({
      amount: 0,
      categoryId: categories.find(c => c.type === "expense")?.id || "",
      accountId: accounts[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      tags: [],
      type: "expense",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (txn: Transaction) => {
    setError(null);
    setEditingTransaction(txn);
    setFormData({
      amount: txn.amount,
      categoryId: txn.categoryId,
      accountId: txn.accountId,
      date: txn.date,
      notes: txn.notes,
      tags: txn.tags,
      type: txn.type,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = { ...formData };
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await addTransaction(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save transaction");
    } finally {
      setSaving(false);
    }
  };

  const handleSingleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteTransaction(id);
    } catch (err: any) {
      setError(err?.message || "Failed to delete transaction");
    }
    setDeleteConfirmId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteConfirm(true);
  };

  const executeBulkDelete = async () => {
    setError(null);
    try {
      await deleteTransactions(selectedIds);
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
    } catch (err: any) {
      setError(err?.message || "Failed to delete transactions");
      setBulkDeleteConfirm(false);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.color || "#6B7280";
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "Unknown";
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || "Unknown";
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Transactions</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Track and manage all your income and expenses</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
            >
              <TrashBinIcon className="w-4 h-4" />
              Delete ({selectedIds.length})
            </button>
          )}
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-4 px-4 w-12"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4 mx-auto" /></th>
                  <th className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" /></th>
                  <th className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></th>
                  <th className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" /></th>
                  <th className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12" /></th>
                  <th className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto" /></th>
                  <th className="py-4 px-4 w-24"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto" /></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredTransactions.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <SearchIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {search || filterType !== "all" || filterCategory !== "all" ? "No matching transactions" : "No transactions yet"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {search || filterType !== "all" || filterCategory !== "all"
              ? "Try adjusting your filters"
              : "Get started by recording your first transaction"}
          </p>
          {(search || filterType !== "all" || filterCategory !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilterType("all"); setFilterCategory("all"); }}
              className="text-sm text-brand-500 hover:text-brand-600"
            >
              Clear filters
            </button>
          )}
          {!search && filterType === "all" && filterCategory === "all" && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Transaction
            </button>
          )}
        </div>
      )}

      {/* Transactions — Table (desktop) */}
      {!loading && filteredTransactions.length > 0 && (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {filteredTransactions.map(txn => (
              <div key={txn.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${txn.type === "income" ? "bg-success-50 dark:bg-success-500/10" : "bg-error-50 dark:bg-error-500/10"}`}>
                      {txn.type === "income" ? "↑" : "↓"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{txn.notes || getCategoryName(txn.categoryId)}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(txn.categoryId) }}></span>
                          {getCategoryName(txn.categoryId)}
                        </span>
                        <span>•</span>
                        <span>{getAccountName(txn.accountId)}</span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-base font-bold ${txn.type === "income" ? "text-success-600" : "text-error-600"}`}>
                      {txn.type === "income" ? "+" : "-"}{txn.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <button onClick={() => openEditModal(txn)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-brand-500">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    <button onClick={() => setDeleteConfirmId(txn.id)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-error-500">
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                    </div>
                  </div>
                </div>
                {txn.tags.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {txn.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-4 px-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={() => setSelectedIds(selectedIds.length === filteredTransactions.length ? [] : filteredTransactions.map(t => t.id))}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Category</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Account</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(txn => (
                  <tr key={txn.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(txn.id)}
                        onChange={() => toggleSelect(txn.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{txn.notes || getCategoryName(txn.categoryId)}</p>
                        <div className="flex gap-1 mt-1">
                          {txn.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(txn.categoryId) }}></span>
                        {getCategoryName(txn.categoryId)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {getAccountName(txn.accountId)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className={`py-4 px-4 text-sm font-semibold text-right ${txn.type === "income" ? "text-success-600" : "text-error-600"}`}>
                      {txn.type === "income" ? "+" : "-"}{txn.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEditModal(txn)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-500">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(txn.id)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-error-500">
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                {editingTransaction ? "Edit Transaction" : "Add Transaction"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {error && (
              <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => {
                    const type = e.target.value as Transaction["type"];
                    const defaultCat = categories.find(c => c.type === type)?.id || "";
                    setFormData({ ...formData, type, categoryId: defaultCat });
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <CurrencyInput
                  value={formData.amount}
                  onChange={(val) => setFormData({ ...formData, amount: val })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
                  min={0.01}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
                >
                  {filteredCategories.length === 0 ? (
                    <option value="">No categories yet</option>
                  ) : (
                    filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                <select
                  value={formData.accountId}
                  onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  placeholder="Optional note"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={e => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  placeholder="work, essential, subscription"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {editingTransaction ? "Update" : "Add"} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setDeleteConfirmId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Transaction</h3>
              <button onClick={() => setDeleteConfirmId(null)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSingleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirmation dialog */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setBulkDeleteConfirm(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Transactions</h3>
              <button onClick={() => setBulkDeleteConfirm(false)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete {selectedIds.length} transactions? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkDelete}
                className="px-4 py-2 bg-error-500 text-white rounded-lg hover:bg-error-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
