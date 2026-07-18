"use client";

import React, { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import CurrencyInput from "@/components/form/CurrencyInput";
import {
  PlusIcon,
  PencilIcon,
  TrashBinIcon,
  WalletIcon,
  BankIcon,
  SearchIcon,
  MoreDotIcon,
  CloseIcon,
} from "@/icons";
import { Account } from "@/lib/types";

const accountTypeIcons: Record<string, React.ReactNode> = {
  cash: <WalletIcon className="text-success-500" />,
  bank: <BankIcon className="text-brand-500" />,
  savings: <WalletIcon className="text-blue-light-500" />,
  credit_card: <BankIcon className="text-error-500" />,
  ewallet: <WalletIcon className="text-purple-500" />,
  investment: <BankIcon className="text-warning-500" />,
  crypto: <WalletIcon className="text-orange-500" />,
};

export default function AccountsPage() {
  const { accounts, loading, addAccount, updateAccount, deleteAccount } = useFinance();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank" as Account["type"],
    balance: 0,
    availableBalance: 0,
    currency: "₱",
    institution: "",
  });

  const filteredAccounts = accounts.filter(acc =>
    acc.name.toLowerCase().includes(search.toLowerCase()) ||
    acc.institution.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setError(null);
    setEditingAccount(null);
    setFormData({ name: "", type: "bank", balance: 0, availableBalance: 0, currency: "₱", institution: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setError(null);
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      availableBalance: account.availableBalance,
      currency: account.currency,
      institution: account.institution,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, formData);
      } else {
        await addAccount(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteAccount(id);
    } catch (err: any) {
      setError(err?.message || "Failed to delete account");
    }
    setDeleteConfirmId(null);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Accounts</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage all your accounts in one place</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Account
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">Dismiss</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredAccounts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <BankIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {search ? "No matching accounts" : "No accounts yet"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {search ? "Try adjusting your search" : "Get started by adding your first account"}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-sm text-brand-500 hover:text-brand-600">
              Clear search
            </button>
          )}
          {!search && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Add Account
            </button>
          )}
        </div>
      )}

      {/* Account Cards */}
      {!loading && filteredAccounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccounts.map(account => (
            <div key={account.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0">
                    <span className="text-2xl">{accountTypeIcons[account.type]}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">{account.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{account.institution}</p>
                  </div>
                </div>
                <div className="relative shrink-0">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === account.id ? null : account.id)}
                    className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MoreDotIcon className="text-gray-400" />
                  </button>
                  {openDropdownId === account.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                      <div className="absolute right-0 top-8 z-20 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                        <button
                          onClick={() => { setOpenDropdownId(null); openEditModal(account); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => { setOpenDropdownId(null); setDeleteConfirmId(account.id); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <TrashBinIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    {account.currency}{account.balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Available: {account.currency}{account.availableBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="capitalize">{account.type.replace("_", " ")}</span>
                  <span>{new Date(account.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto bg-white p-6 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                {editingAccount ? "Edit Account" : "Add Account"}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as Account["type"] })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                >
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
                <input
                  type="text"
                  value={formData.institution}
                  onChange={e => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Balance</label>
                  <CurrencyInput
                    value={formData.balance}
                    onChange={(val) => setFormData({ ...formData, balance: val, availableBalance: val })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                    required
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available</label>
                  <CurrencyInput
                    value={formData.availableBalance}
                    onChange={(val) => setFormData({ ...formData, availableBalance: val })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                    min={0}
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Spendable now — auto-fills to match balance</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
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
                  {editingAccount ? "Update" : "Add"} Account
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
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Account</h3>
              <button onClick={() => setDeleteConfirmId(null)} className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this account? All associated transactions will also be removed. This action cannot be undone.
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
