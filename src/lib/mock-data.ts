import { Account, Category, Transaction, Budget, SavingsGoal, Bill, Notification, AppData } from './types';

export const getDefaultData = (): AppData => {
  const categories: Category[] = [
    { id: 'cat-1', name: 'Salary', type: 'income', icon: '💼', color: '#10B981' },
    { id: 'cat-2', name: 'Freelance', type: 'income', icon: '💻', color: '#3B82F6' },
    { id: 'cat-3', name: 'Investment', type: 'income', icon: '📈', color: '#8B5CF6' },
    { id: 'cat-4', name: 'Food', type: 'expense', icon: '🍔', color: '#EF4444' },
    { id: 'cat-5', name: 'Transportation', type: 'expense', icon: '🚗', color: '#F59E0B' },
    { id: 'cat-6', name: 'Bills', type: 'expense', icon: '📄', color: '#6366F1' },
    { id: 'cat-7', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#EC4899' },
    { id: 'cat-8', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#14B8A6' },
    { id: 'cat-9', name: 'Healthcare', type: 'expense', icon: '🏥', color: '#F97316' },
    { id: 'cat-10', name: 'Education', type: 'expense', icon: '📚', color: '#06B6D4' },
    { id: 'cat-11', name: 'Travel', type: 'expense', icon: '✈️', color: '#8B5CF6' },
    { id: 'cat-12', name: 'Interest', type: 'income', icon: '💰', color: '#10B981' },
  ];

  const accounts: Account[] = [
    { id: 'acc-1', name: 'Cash', type: 'cash', balance: 5000, availableBalance: 5000, currency: '₱', institution: 'Personal', lastUpdated: new Date().toISOString() },
    { id: 'acc-2', name: 'BDO Savings', type: 'bank', balance: 125000, availableBalance: 120000, currency: '₱', institution: 'BDO', lastUpdated: new Date().toISOString() },
    { id: 'acc-3', name: 'BPI Current', type: 'bank', balance: 45000, availableBalance: 45000, currency: '₱', institution: 'BPI', lastUpdated: new Date().toISOString() },
    { id: 'acc-4', name: 'GCash', type: 'ewallet', balance: 8500, availableBalance: 8500, currency: '₱', institution: 'GCash', lastUpdated: new Date().toISOString() },
    { id: 'acc-5', name: 'Maya', type: 'ewallet', balance: 3200, availableBalance: 3200, currency: '₱', institution: 'Maya', lastUpdated: new Date().toISOString() },
    { id: 'acc-6', name: 'BDO Credit', type: 'credit_card', balance: -15000, availableBalance: 35000, currency: '₱', institution: 'BDO', lastUpdated: new Date().toISOString() },
    { id: 'acc-7', name: 'Coins.ph', type: 'ewallet', balance: 1500, availableBalance: 1500, currency: '₱', institution: 'Coins.ph', lastUpdated: new Date().toISOString() },
    { id: 'acc-8', name: 'Bitcoin', type: 'crypto', balance: 25000, availableBalance: 25000, currency: '₱', institution: 'Binance', lastUpdated: new Date().toISOString() },
  ];

  const today = new Date();
  const transactions: Transaction[] = [
    { id: 'txn-1', amount: 85000, categoryId: 'cat-1', accountId: 'acc-2', date: formatDate(daysAgo(today, 2)), notes: 'Monthly salary', tags: ['work'], type: 'income' },
    { id: 'txn-2', amount: 12000, categoryId: 'cat-2', accountId: 'acc-3', date: formatDate(daysAgo(today, 5)), notes: 'Freelance project', tags: ['work', 'online'], type: 'income' },
    { id: 'txn-3', amount: 3500, categoryId: 'cat-4', accountId: 'acc-4', date: formatDate(today), notes: 'Groceries', tags: ['essential'], type: 'expense' },
    { id: 'txn-4', amount: 1500, categoryId: 'cat-5', accountId: 'acc-1', date: formatDate(daysAgo(today, 1)), notes: 'Grab to work', tags: ['transport'], type: 'expense' },
    { id: 'txn-5', amount: 2500, categoryId: 'cat-6', accountId: 'acc-2', date: formatDate(daysAgo(today, 3)), notes: 'Electricity bill', tags: ['utilities'], type: 'expense' },
    { id: 'txn-6', amount: 4500, categoryId: 'cat-8', accountId: 'acc-4', date: formatDate(daysAgo(today, 7)), notes: 'Netflix + Spotify', tags: ['subscription'], type: 'expense' },
    { id: 'txn-7', amount: 8900, categoryId: 'cat-7', accountId: 'acc-3', date: formatDate(daysAgo(today, 10)), notes: 'New shoes', tags: ['shopping'], type: 'expense' },
    { id: 'txn-8', amount: 5600, categoryId: 'cat-9', accountId: 'acc-2', date: formatDate(daysAgo(today, 12)), notes: 'Dental checkup', tags: ['health'], type: 'expense' },
    { id: 'txn-9', amount: 5000, categoryId: 'cat-3', accountId: 'acc-2', date: formatDate(daysAgo(today, 15)), notes: 'Dividends', tags: ['passive'], type: 'income' },
    { id: 'txn-10', amount: 2000, categoryId: 'cat-4', accountId: 'acc-4', date: formatDate(daysAgo(today, 4)), notes: 'Lunch with team', tags: ['food'], type: 'expense' },
    { id: 'txn-11', amount: 3000, categoryId: 'cat-10', accountId: 'acc-3', date: formatDate(daysAgo(today, 20)), notes: 'Online course', tags: ['learning'], type: 'expense' },
    { id: 'txn-12', amount: 15000, categoryId: 'cat-11', accountId: 'acc-2', date: formatDate(daysAgo(today, 25)), notes: 'Palawan trip', tags: ['vacation'], type: 'expense' },
  ];

  const budgets: Budget[] = [
    { id: 'budg-1', categoryId: 'cat-4', amount: 10000, spent: 8250, period: 'monthly', startDate: formatDate(daysAgo(today, 30)), endDate: formatDate(today) },
    { id: 'budg-2', categoryId: 'cat-5', amount: 5000, spent: 3500, period: 'monthly', startDate: formatDate(daysAgo(today, 30)), endDate: formatDate(today) },
    { id: 'budg-3', categoryId: 'cat-6', amount: 8000, spent: 7800, period: 'monthly', startDate: formatDate(daysAgo(today, 30)), endDate: formatDate(today) },
    { id: 'budg-4', categoryId: 'cat-7', amount: 10000, spent: 12400, period: 'monthly', startDate: formatDate(daysAgo(today, 30)), endDate: formatDate(today) },
    { id: 'budg-5', categoryId: 'cat-8', amount: 6000, spent: 4500, period: 'monthly', startDate: formatDate(daysAgo(today, 30)), endDate: formatDate(today) },
  ];

  const savingsGoals: SavingsGoal[] = [
    { id: 'goal-1', name: 'Japan Trip', targetAmount: 120000, savedAmount: 45000, deadline: formatDate(daysAgo(today, -180)), contributions: [
      { date: formatDate(daysAgo(today, 60)), amount: 15000 },
      { date: formatDate(daysAgo(today, 30)), amount: 20000 },
      { date: formatDate(today), amount: 10000 },
    ]},
    { id: 'goal-2', name: 'New Laptop', targetAmount: 80000, savedAmount: 35000, deadline: formatDate(daysAgo(today, -90)), contributions: [
      { date: formatDate(daysAgo(today, 45)), amount: 15000 },
      { date: formatDate(daysAgo(today, 15)), amount: 20000 },
    ]},
    { id: 'goal-3', name: 'Emergency Fund', targetAmount: 200000, savedAmount: 125000, deadline: formatDate(daysAgo(today, -365)), contributions: [
      { date: formatDate(daysAgo(today, 120)), amount: 50000 },
      { date: formatDate(daysAgo(today, 60)), amount: 40000 },
      { date: formatDate(daysAgo(today, 30)), amount: 35000 },
    ]},
  ];

  const bills: Bill[] = [
    { id: 'bill-1', name: 'Electricity', amount: 3500, dueDate: formatDate(daysAgo(today, -2)), autoPay: true, reminder: true, paid: true, accountId: 'acc-2' },
    { id: 'bill-2', name: 'Internet', amount: 1999, dueDate: formatDate(daysAgo(today, -1)), autoPay: true, reminder: true, paid: true, accountId: 'acc-2' },
    { id: 'bill-3', name: 'Rent', amount: 25000, dueDate: formatDate(daysAgo(today, 3)), autoPay: false, reminder: true, paid: false, accountId: 'acc-2' },
    { id: 'bill-4', name: 'Netflix', amount: 699, dueDate: formatDate(daysAgo(today, 4)), autoPay: true, reminder: true, paid: false, accountId: 'acc-4' },
    { id: 'bill-5', name: 'Spotify', amount: 159, dueDate: formatDate(daysAgo(today, 2)), autoPay: true, reminder: false, paid: true, accountId: 'acc-4' },
    { id: 'bill-6', name: 'Water', amount: 450, dueDate: formatDate(daysAgo(today, 5)), autoPay: false, reminder: true, paid: false, accountId: 'acc-2' },
  ];

  const notifications: Notification[] = [
    { id: 'notif-1', title: 'Budget Alert', message: 'You have exceeded your Shopping budget by ₱2,400', type: 'warning', time: formatDate(daysAgo(today, 1)), read: false },
    { id: 'notif-2', title: 'Bill Due Tomorrow', message: 'Rent payment of ₱25,000 is due tomorrow', type: 'info', time: formatDate(today), read: false },
    { id: 'notif-3', title: 'Goal Reached', message: 'Congratulations! You reached 37% of your Japan Trip goal', type: 'success', time: formatDate(daysAgo(today, 3)), read: true },
    { id: 'notif-4', title: 'New Income', message: 'Freelance payment of ₱12,000 received', type: 'success', time: formatDate(daysAgo(today, 5)), read: true },
    { id: 'notif-5', title: 'Large Expense', message: 'You spent ₱15,000 on Travel this month', type: 'warning', time: formatDate(daysAgo(today, 7)), read: true },
  ];

  return {
    accounts,
    transactions,
    categories,
    budgets,
    savingsGoals,
    bills,
    notifications,
  };
};

function daysAgo(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
