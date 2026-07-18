"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import CurrencyInput from "@/components/form/CurrencyInput";
import {
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  MoreDotIcon,
  CheckCircleIcon,
  TimeIcon as ClockIcon,
  AlertIcon,
  CloseIcon,
} from "@/icons";

export default function BillsPage() {
  const { bills, accounts, loading, addBill, updateBill, deleteBill, markBillPaid } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<typeof bills[0] | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "paid">("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [markPaidConfirmId, setMarkPaidConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    dueDate: "",
    autoPay: false,
    reminder: false,
    accountId: accounts[0]?.id || "",
  });

  const filteredBills = bills.filter(b => {
    if (filter === "upcoming") return !b.paid;
    if (filter === "paid") return b.paid;
    return true;
  });

  const getDefaultAccountId = () => {
    const bank = accounts.find(a => a.type === "bank");
    if (bank) return bank.id;
    return accounts[0]?.id || "";
  };

  const openAddModal = () => {
    setEditingBill(null);
    setFormData({ name: "", amount: 0, dueDate: "", autoPay: false, reminder: false, accountId: getDefaultAccountId() });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bill: typeof bills[0]) => {
    setEditingBill(bill);
    setFormData({ name: bill.name, amount: bill.amount, dueDate: bill.dueDate, autoPay: bill.autoPay, reminder: bill.reminder, accountId: bill.accountId });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingBill) {
        await updateBill(editingBill.id, formData);
      } else {
        await addBill({ ...formData, paid: false });
      }
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to save bill. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteBill(id);
    } catch (err) {
      setError("Failed to delete bill. Please try again.");
    }
    setDeleteConfirmId(null);
  };

  const handleMarkPaid = async (id: string) => {
    setError(null);
    try {
      await markBillPaid(id);
    } catch (err) {
      setError("Failed to mark bill as paid. Please try again.");
    }
    setMarkPaidConfirmId(null);
  };

  const getAccountName = (accountId: string) => accounts.find(a => a.id === accountId)?.name || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Bills</h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Track and manage your upcoming bills</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600">
          <PlusIcon className="w-5 h-5" />
          Add Bill
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 p-3 text-error-600 dark:text-error-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="flex gap-2">
        {["all", "upcoming", "paid"].map(f => (
          <button key={f} onClick={() => setFilter(f as typeof filter)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            {f === "all" ? "All Bills" : f === "upcoming" ? "Upcoming" : "Paid"}
          </button>
        ))}
      </div>

      {/* Mobile Card View */}
      {loading ? (
        <div className="sm:hidden space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="text-right space-y-2">
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="sm:hidden space-y-3">
        {filteredBills.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="mb-4">No bills yet</p>
            <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">
              <PlusIcon className="w-4 h-4" />
              Add Your First Bill
            </button>
          </div>
        ) : (
          filteredBills.map(bill => (
            <div key={bill.id} className={`rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] ${bill.paid ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{bill.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{getAccountName(bill.accountId)}</p>
                  <p className={`text-xs mt-1 ${new Date(bill.dueDate) < new Date() && !bill.paid ? "text-error-600 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                    Due {new Date(bill.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-gray-800 dark:text-white/90">₱{bill.amount.toLocaleString()}</p>
                  {bill.paid ? (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                      <CheckCircleIcon className="w-3 h-3" /> Paid
                    </span>
                  ) : new Date(bill.dueDate) < new Date() ? (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
                      <AlertIcon className="w-3 h-3" /> Overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                      <ClockIcon className="w-3 h-3" /> Upcoming
                    </span>
                  )}
                </div>
              </div>
              {(bill.autoPay || bill.reminder) && (
                <div className="flex gap-1 mt-3">
                  {bill.autoPay && <span className="text-xs px-2 py-0.5 bg-blue-light-50 text-blue-light-500 rounded-full">Auto Pay</span>}
                  {bill.reminder && <span className="text-xs px-2 py-0.5 bg-warning-50 text-warning-600 rounded-full">Reminder</span>}
                </div>
              )}
              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {!bill.paid && (
                  <button onClick={() => setMarkPaidConfirmId(bill.id)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-success-500">
                    <CheckCircleIcon className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => openEditModal(bill)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-brand-500">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteConfirmId(bill.id)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-error-500">
                  <TrashBinIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* Desktop Table */}
      {loading ? (
        <div className="hidden sm:block rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Bill</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Account</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Due Date</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map(i => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-4 px-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto" /></td>
                    <td className="py-4 px-4"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto" /></td>
                    <td className="py-4 px-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      <div className="hidden sm:block rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Bill</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Account</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Due Date</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <p className="mb-4">No bills yet</p>
                    <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">
                      <PlusIcon className="w-4 h-4" />
                      Add Your First Bill
                    </button>
                  </td>
                </tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill.id} className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${bill.paid ? "opacity-60" : ""}`}>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{bill.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {bill.autoPay && <span className="text-xs px-2 py-0.5 bg-blue-light-50 text-blue-light-500 rounded-full">Auto Pay</span>}
                          {bill.reminder && <span className="text-xs px-2 py-0.5 bg-warning-50 text-warning-600 rounded-full">Reminder</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">{getAccountName(bill.accountId)}</td>
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className={new Date(bill.dueDate) < new Date() && !bill.paid ? "text-error-600 font-medium" : ""}>
                        {new Date(bill.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-right text-gray-800 dark:text-white/90">₱{bill.amount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      {bill.paid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500">
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : new Date(bill.dueDate) < new Date() ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
                          <AlertIcon className="w-3.5 h-3.5" /> Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                          <ClockIcon className="w-3.5 h-3.5" /> Upcoming
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {!bill.paid && (
                          <button onClick={() => setMarkPaidConfirmId(bill.id)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-success-500" title="Mark as Paid">
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openEditModal(bill)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-brand-500">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(bill.id)} className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-error-500">
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">{editingBill ? "Edit Bill" : "Add Bill"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <CurrencyInput value={formData.amount} onChange={(val) => setFormData({ ...formData, amount: val })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required min={0.01} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                <select value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90">
                  {accounts.length === 0 ? (
                    <option value="">No accounts available</option>
                  ) : (
                    accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.autoPay} onChange={e => setFormData({ ...formData, autoPay: e.target.checked })} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto Pay</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.reminder} onChange={e => setFormData({ ...formData, reminder: e.target.checked })} className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Reminder</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
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
                  {editingBill ? "Update" : "Add"} Bill
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
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Bill</h3>
              <button onClick={() => setDeleteConfirmId(null)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this bill? This action cannot be undone.
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

      {/* Mark as paid confirmation dialog */}
      {markPaidConfirmId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setMarkPaidConfirmId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Mark Bill as Paid</h3>
              <button onClick={() => setMarkPaidConfirmId(null)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to mark this bill as paid?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMarkPaidConfirmId(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMarkPaid(markPaidConfirmId)}
                className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
              >
                Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
