"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import CurrencyInput from "@/components/form/CurrencyInput";
import {
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  TargetIcon,
  MoreDotIcon,
  AlertIcon,
  CheckCircleIcon,
  CloseIcon,
} from "@/icons";

export default function BudgetPage() {
  const { budgets, loading, addBudget, updateBudget, deleteBudget, categories } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<typeof budgets[0] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryId: categories.find(c => c.type === "expense")?.id || "",
    amount: 0,
    period: "monthly" as "monthly" | "weekly",
  });

  const openAddModal = () => {
    setEditingBudget(null);
    setFormData({ categoryId: categories.find(c => c.type === "expense")?.id || "", amount: 0, period: "monthly" });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget: typeof budgets[0]) => {
    setEditingBudget(budget);
    setFormData({ categoryId: budget.categoryId, amount: budget.amount, period: budget.period });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, formData);
      } else {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split("T")[0];
        await addBudget({ ...formData, spent: 0, startDate: start, endDate: end });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to save budget. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return;
    setError(null);
    try {
      await deleteBudget(id);
    } catch (err) {
      setError("Failed to delete budget. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Budget Planner</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Set and track your spending budgets</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          <PlusIcon className="w-5 h-5" />
          Add Budget
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 p-3 text-error-600 dark:text-error-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-400 dark:text-gray-500">No budgets yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            const percentage = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
            const isOver = budget.spent > budget.amount;
            const remaining = budget.amount - budget.spent;
            return (
              <div key={budget.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category?.icon || "📊"}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{category?.name || "Unknown"}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{budget.period} Budget</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="dropdown-toggle p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <MoreDotIcon className="text-gray-400" />
                    </button>
                    <div className="absolute right-0 top-8 hidden group-hover:block z-10 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      <button onClick={() => openEditModal(budget)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <PencilIcon className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDelete(budget.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <TrashBinIcon className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Spent</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-white/90">₱{budget.spent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                      <p className="text-xl font-bold text-gray-800 dark:text-white/90">₱{budget.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${isOver ? "bg-error-500" : "bg-brand-500"}`} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <span className="inline-flex items-center gap-1 text-sm text-error-600"><AlertIcon className="w-4 h-4" /> Over by ₱{(budget.spent - budget.amount).toLocaleString()}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-success-600"><CheckCircleIcon className="w-4 h-4" /> ₱{remaining.toLocaleString()} remaining</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(percentage)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 flex flex-col max-h-[85vh] sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative p-6 pb-2 shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{editingBudget ? "Edit Budget" : "Add Budget"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto overscroll-contain px-6 pb-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                >
                  {categories.filter(c => c.type === "expense").map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period</label>
                <select
                  value={formData.period}
                  onChange={e => setFormData({ ...formData, period: e.target.value as "monthly" | "weekly" })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  )}
                  {editingBudget ? "Update" : "Add"} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
