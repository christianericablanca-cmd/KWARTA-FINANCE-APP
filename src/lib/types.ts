export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'savings' | 'credit_card' | 'ewallet' | 'investment' | 'crypto';
  balance: number;
  availableBalance: number;
  currency: string;
  institution: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  accountId: string;
  date: string;
  notes: string;
  receiptImage?: string;
  tags: string[];
  type: 'income' | 'expense' | 'transfer';
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budget?: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  contributions: { date: string; amount: number }[];
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  autoPay: boolean;
  reminder: boolean;
  paid: boolean;
  accountId: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  currency: string;
  timezone: string;
  language: string;
  theme: string;
}

export interface AppData {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  bills: Bill[];
  notifications: Notification[];
}

export type RootStackParamList = {
  dashboard: undefined;
  accounts: undefined;
  transactions: undefined;
  categories: undefined;
  budget: undefined;
  savingsGoals: undefined;
  analytics: undefined;
  reports: undefined;
  bills: undefined;
  calendar: undefined;
  notifications: undefined;
  search: undefined;
  profile: undefined;
  settings: undefined;
};
