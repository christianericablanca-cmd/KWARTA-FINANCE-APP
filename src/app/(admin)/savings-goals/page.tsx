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
  ArrowUpIcon,
  CloseIcon,
} from "@/icons";

export default function SavingsGoalsPage() {
  const { savingsGoals, loading, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addContribution } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<typeof savingsGoals[0] | null>(null);
  const [contributionGoalId, setContributionGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openGoalDropdownId, setOpenGoalDropdownId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: 0,
    savedAmount: 0,
    deadline: "",
  });

  const openAddModal = () => {
    setEditingGoal(null);
    setFormData({ name: "", targetAmount: 0, savedAmount: 0, deadline: "" });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (goal: typeof savingsGoals[0]) => {
    setEditingGoal(goal);
    setFormData({ name: goal.name, targetAmount: goal.targetAmount, savedAmount: goal.savedAmount, deadline: goal.deadline });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingGoal) {
        await updateSavingsGoal(editingGoal.id, formData);
      } else {
        await addSavingsGoal({ ...formData, contributions: [] });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to save goal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteSavingsGoal(id);
    } catch (err) {
      setError("Failed to delete goal. Please try again.");
    }
    setDeleteConfirmId(null);
  };

  const openContributionModal = (goalId: string) => {
    setContributionGoalId(goalId);
    setContributionAmount(0);
    setShowContributionModal(true);
  };

  const handleContribution = async () => {
    if (contributionGoalId && contributionAmount > 0) {
      setSaving(true);
      setError(null);
      try {
        await addContribution(contributionGoalId, contributionAmount);
        setShowContributionModal(false);
        setContributionGoalId(null);
        setContributionAmount(0);
      } catch (err) {
        setError("Failed to add contribution. Please try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Savings Goals</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Track progress toward your financial goals</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          <PlusIcon className="w-5 h-5" />
          Add Goal
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 p-3 text-error-600 dark:text-error-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : savingsGoals.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 dark:border-gray-800 dark:bg-white/[0.03] text-center">
          <p className="text-gray-400 dark:text-gray-500 mb-4">No goals yet</p>
          <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">
            <PlusIcon className="w-4 h-4" />
            Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {savingsGoals.map(goal => {
            const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
            const deadlineMs = goal.deadline ? new Date(goal.deadline).getTime() : NaN;
            const nowMs = new Date().getTime();
            const daysLeft = !isNaN(deadlineMs) ? Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24)) : NaN;
            return (
              <div key={goal.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10">
                      <TargetIcon className="text-brand-500 w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">{goal.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {!isNaN(daysLeft) ? (daysLeft > 0 ? `${daysLeft} days left` : "Goal passed") : "No deadline"}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenGoalDropdownId(openGoalDropdownId === goal.id ? null : goal.id)}
                      className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreDotIcon className="text-gray-400" />
                    </button>
                    {openGoalDropdownId === goal.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenGoalDropdownId(null)} />
                        <div className="absolute right-0 top-8 z-20 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      <button onClick={() => openEditModal(goal)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <PencilIcon className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => setDeleteConfirmId(goal.id)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <TrashBinIcon className="w-4 h-4" /> Delete
                      </button>
                    </div>
                        </>
                      )}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-800 dark:text-white/90">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div className="bg-brand-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Saved</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white/90">₱{goal.savedAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
                      <p className="text-lg font-bold text-gray-800 dark:text-white/90">₱{goal.targetAmount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => openContributionModal(goal.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400">
                      <PlusIcon className="w-4 h-4" /> Add
                    </button>
                    <div className="flex items-center gap-1 text-success-600 dark:text-success-500 text-sm">
                      <ArrowUpIcon className="w-4 h-4" /> {goal.contributions.length} contributions
                    </div>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 flex flex-col max-h-[85vh] sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative p-6 pb-2 shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{editingGoal ? "Edit Goal" : "Add Goal"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto overscroll-contain px-6 pb-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount</label>
                <CurrencyInput value={formData.targetAmount} onChange={(val) => setFormData({ ...formData, targetAmount: val })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required min={0.01} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Saved</label>
                <CurrencyInput value={formData.savedAmount} onChange={(val) => setFormData({ ...formData, savedAmount: val })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required min={0.01} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required />
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
                  {editingGoal ? "Update" : "Add"} Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showContributionModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowContributionModal(false)}>
          <div className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 flex flex-col max-h-[85vh] sm:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="relative p-6 pb-2 shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Add Contribution</h3>
              <button onClick={() => setShowContributionModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-6 pb-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <CurrencyInput value={contributionAmount} onChange={(val) => setContributionAmount(val)} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required min={0.01} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900">
              <button onClick={() => setShowContributionModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button
                onClick={handleContribution}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                )}
                Add Contribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={() => setDeleteConfirmId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Goal</h3>
              <button onClick={() => setDeleteConfirmId(null)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this savings goal? All contributions will also be removed. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
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
