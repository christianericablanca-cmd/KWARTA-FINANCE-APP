"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Account, Transaction, Category, Budget, SavingsGoal, Bill, Notification, Profile, AppData } from '@/lib/types';
import { supabaseDb } from '@/lib/supabase/db-browser';
import { createClient } from '@/lib/supabase/client';
import { getDefaultData } from '@/lib/mock-data';

interface FinanceContextType {
  data: AppData;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  notifications: Notification[];
  profile: Profile | null;
  loading: boolean;
  
  // Account CRUD
  addAccount: (account: Partial<Account>) => Promise<void>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  // Transaction CRUD
  addTransaction: (transaction: Partial<Transaction>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactions: (ids: string[]) => Promise<void>;
  
  // Category CRUD
  addCategory: (category: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Budget CRUD
  addBudget: (budget: Partial<Budget>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Savings Goal CRUD
  addSavingsGoal: (goal: Partial<SavingsGoal>) => Promise<void>;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addContribution: (goalId: string, amount: number) => Promise<void>;
  
  // Bill CRUD
  addBill: (bill: Partial<Bill>) => Promise<void>;
  updateBill: (id: string, bill: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  markBillPaid: (id: string) => Promise<void>;
  
  // Notification
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  
  // Utility
  refreshData: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<AppData>(getDefaultData);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const refreshData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setUserId(user.id);
    setLoading(true);
    try {
      const [accounts, categories, transactions, budgets, savingsGoals, bills, notifications, userProfile] = await Promise.all([
        supabaseDb.getAccounts(user.id),
        supabaseDb.getCategories(user.id),
        supabaseDb.getTransactions(user.id),
        supabaseDb.getBudgets(user.id),
        supabaseDb.getSavingsGoals(user.id),
        supabaseDb.getBills(user.id),
        supabaseDb.getNotifications(user.id),
        supabaseDb.getProfile(user.id),
      ]);

      // Convert database format to app format
      const savingsGoalsWithContributions = await Promise.all(
        (savingsGoals as any[]).map(async (goal: any) => {
          const contributions = await supabaseDb.getContributions(goal.id);
          return {
            ...goal,
            savedAmount: goal.saved_amount,
            targetAmount: goal.target_amount,
            deadline: goal.deadline,
            contributions: contributions.map(c => ({
              date: c.date,
              amount: parseFloat(c.amount as any) || 0,
            })),
          };
        })
      );

      setData({
        accounts: (accounts as any[]).map(a => ({
          id: a.id,
          name: a.name,
          type: a.type as Account['type'],
          balance: parseFloat(a.balance as any) || 0,
          availableBalance: parseFloat(a.available_balance as any) || 0,
          currency: a.currency,
          institution: a.institution || '',
          lastUpdated: a.last_updated,
        })),
        categories: (categories as any[]).map(c => ({
          id: c.id,
          name: c.name,
          type: c.type as 'income' | 'expense',
          icon: c.icon,
          color: c.color,
          budget: (c.budget !== undefined && c.budget !== null) ? parseFloat(c.budget as any) || 0 : undefined,
        })),
        transactions: (transactions as any[]).map(t => ({
          id: t.id,
          amount: parseFloat(t.amount as any) || 0,
          categoryId: t.category_id,
          accountId: t.account_id,
          date: t.date,
          notes: t.notes,
          receiptImage: t.receipt_image,
          tags: t.tags || [],
          type: t.type as 'income' | 'expense' | 'transfer',
        })),
        budgets: (budgets as any[]).map(b => ({
          id: b.id,
          categoryId: b.category_id,
          amount: parseFloat(b.amount as any) || 0,
          spent: parseFloat(b.spent as any) || 0,
          period: b.period as 'weekly' | 'monthly',
          startDate: b.start_date,
          endDate: b.end_date,
        })),
        savingsGoals: savingsGoalsWithContributions,
        bills: (bills as any[]).map(b => ({
          id: b.id,
          name: b.name,
          amount: parseFloat(b.amount as any) || 0,
          dueDate: b.due_date,
          autoPay: b.auto_pay,
          reminder: b.reminder,
          paid: b.paid,
          accountId: b.account_id,
        })),
        notifications: notifications.map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as 'info' | 'success' | 'warning' | 'error',
          time: n.time,
          read: n.read,
        })),
      });

      setProfile(userProfile);

      // Sync full_name from auth metadata if profile is missing it
      if (userProfile && !userProfile.fullName && user.user_metadata?.full_name) {
        const fullName = user.user_metadata.full_name as string;
        await supabaseDb.updateProfile(user.id, { fullName });
        setProfile({ ...userProfile, fullName });
      }
    } catch (error) {
      // Silently handle - UI shows empty data with retry via refresh
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await refreshData();
      } else {
        setLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await refreshData();
      } else {
        setData(getDefaultData());
        setProfile(null);
        setUserId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Account CRUD
  const addAccount = async (account: Partial<Account>) => {
    if (!userId) return;
    await supabaseDb.createAccount(userId, account);
    await refreshData();
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    await supabaseDb.updateAccount(id, updates);
    await refreshData();
  };

  const deleteAccount = async (id: string) => {
    await supabaseDb.deleteAccount(id);
    await refreshData();
  };

  // Transaction CRUD
  const addTransaction = async (transaction: Partial<Transaction>) => {
    if (!userId) return;
    await supabaseDb.createTransaction(userId, transaction);
    if (transaction.accountId && transaction.type && transaction.amount) {
      const account = data.accounts.find(a => a.id === transaction.accountId);
      if (account) {
        const delta = transaction.type === "income" ? transaction.amount : transaction.type === "expense" ? -transaction.amount : 0;
        if (delta !== 0) {
          await supabaseDb.updateAccount(account.id, {
            balance: account.balance + delta,
            availableBalance: account.availableBalance + delta,
          });
        }
      }
    }
    await refreshData();
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const oldTxn = data.transactions.find(t => t.id === id);
    await supabaseDb.updateTransaction(id, updates);

    // Reverse old balance effect, apply new
    if (oldTxn && oldTxn.accountId && oldTxn.type) {
      const oldAccount = data.accounts.find(a => a.id === oldTxn.accountId);
      const newAccount = updates.accountId ? data.accounts.find(a => a.id === updates.accountId) : oldAccount;
      const newType = updates.type ?? oldTxn.type;
      const newAmount = updates.amount ?? oldTxn.amount;

      // Reverse old
      if (oldAccount) {
        const oldDelta = oldTxn.type === "income" ? -oldTxn.amount : oldTxn.type === "expense" ? oldTxn.amount : 0;
        if (oldDelta !== 0) {
          await supabaseDb.updateAccount(oldAccount.id, {
            balance: oldAccount.balance + oldDelta,
            availableBalance: oldAccount.availableBalance + oldDelta,
          });
        }
      }

      // Apply new
      if (newAccount) {
        const newDelta = newType === "income" ? newAmount : newType === "expense" ? -newAmount : 0;
        if (newDelta !== 0) {
          await supabaseDb.updateAccount(newAccount.id, {
            balance: newAccount.balance + newDelta,
            availableBalance: newAccount.availableBalance + newDelta,
          });
        }
      }
    }

    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    const txn = data.transactions.find(t => t.id === id);
    if (txn && txn.accountId && txn.type) {
      const account = data.accounts.find(a => a.id === txn.accountId);
      if (account) {
        const reverse = txn.type === "income" ? -txn.amount : txn.type === "expense" ? txn.amount : 0;
        if (reverse !== 0) {
          await supabaseDb.updateAccount(account.id, {
            balance: account.balance + reverse,
            availableBalance: account.availableBalance + reverse,
          });
        }
      }
    }
    await supabaseDb.deleteTransaction(id);
    await refreshData();
  };

  const deleteTransactions = async (ids: string[]) => {
    for (const id of ids) {
      const txn = data.transactions.find(t => t.id === id);
      if (txn && txn.accountId && txn.type) {
        const account = data.accounts.find(a => a.id === txn.accountId);
        if (account) {
          const reverse = txn.type === "income" ? -txn.amount : txn.type === "expense" ? txn.amount : 0;
          if (reverse !== 0) {
            await supabaseDb.updateAccount(account.id, {
              balance: account.balance + reverse,
              availableBalance: account.availableBalance + reverse,
            });
          }
        }
      }
      await supabaseDb.deleteTransaction(id);
    }
    await refreshData();
  };

  // Category CRUD
  const addCategory = async (category: Partial<Category>) => {
    if (!userId) return;
    await supabaseDb.createCategory(userId, category);
    await refreshData();
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    await supabaseDb.updateCategory(id, updates);
    await refreshData();
  };

  const deleteCategory = async (id: string) => {
    await supabaseDb.deleteCategory(id);
    await refreshData();
  };

  // Budget CRUD
  const addBudget = async (budget: Partial<Budget>) => {
    if (!userId) return;
    await supabaseDb.createBudget(userId, budget);
    await refreshData();
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    await supabaseDb.updateBudget(id, updates);
    await refreshData();
  };

  const deleteBudget = async (id: string) => {
    await supabaseDb.deleteBudget(id);
    await refreshData();
  };

  // Savings Goal CRUD
  const addSavingsGoal = async (goal: Partial<SavingsGoal>) => {
    if (!userId) return;
    await supabaseDb.createSavingsGoal(userId, goal);
    await refreshData();
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    await supabaseDb.updateSavingsGoal(id, updates);
    await refreshData();
  };

  const deleteSavingsGoal = async (id: string) => {
    await supabaseDb.deleteSavingsGoal(id);
    await refreshData();
  };

  const addContribution = async (goalId: string, amount: number) => {
    await supabaseDb.createContribution(goalId, amount);
    await refreshData();
  };

  // Bill CRUD
  const addBill = async (bill: Partial<Bill>) => {
    if (!userId) return;
    await supabaseDb.createBill(userId, bill);
    await refreshData();
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    await supabaseDb.updateBill(id, updates);
    await refreshData();
  };

  const deleteBill = async (id: string) => {
    await supabaseDb.deleteBill(id);
    await refreshData();
  };

  const markBillPaid = async (id: string) => {
    const bill = data.bills.find(b => b.id === id);
    if (bill && bill.accountId && bill.amount > 0) {
      const account = data.accounts.find(a => a.id === bill.accountId);
      if (account) {
        await supabaseDb.updateAccount(account.id, {
          balance: account.balance - bill.amount,
          availableBalance: account.availableBalance - bill.amount,
        });
      }
    }
    await supabaseDb.updateBill(id, { paid: true });
    await refreshData();
  };

  // Notification
  const markNotificationRead = async (id: string) => {
    await supabaseDb.updateNotification(id, { read: true });
    await refreshData();
  };

  const markAllNotificationsRead = async () => {
    for (const n of data.notifications) {
      if (!n.read) {
        await supabaseDb.updateNotification(n.id, { read: true });
      }
    }
    await refreshData();
  };

  // Profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;
    await supabaseDb.updateProfile(userId, updates);
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  // Reset
  const resetAllData = async () => {
    if (!userId) return;
    await supabaseDb.resetAllData(userId);
    await refreshData();
  };

  return (
    <FinanceContext.Provider value={{
      data,
      accounts: data.accounts,
      transactions: data.transactions,
      categories: data.categories,
      budgets: data.budgets,
      savingsGoals: data.savingsGoals,
      bills: data.bills,
      notifications: data.notifications,
      profile,
      loading,
      addAccount,
      updateAccount,
      deleteAccount,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      deleteTransactions,
      addCategory,
      updateCategory,
      deleteCategory,
      addBudget,
      updateBudget,
      deleteBudget,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addContribution,
      addBill,
      updateBill,
      deleteBill,
      markBillPaid,
      markNotificationRead,
      markAllNotificationsRead,
      refreshData,
      updateProfile,
      resetAllData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
