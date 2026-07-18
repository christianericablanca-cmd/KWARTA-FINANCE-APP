"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ApexOptions } from "apexcharts";
import { useFinance } from "@/context/FinanceContext";
import CurrencyInput from "@/components/form/CurrencyInput";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  WalletIcon,
  PieChartIcon,
  CalenderIcon,
  TargetIcon,
  ArrowRightIcon,
  PlusIcon,
  CloseIcon,
} from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function formatCurrency(value: number, currency = "₱") {
  return `${currency}${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function FinanceDashboard() {
  const { accounts, transactions, savingsGoals, categories, bills, loading, addTransaction } = useFinance();

  // Quick-add modal state
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickForm, setQuickForm] = useState({
    type: "expense" as "income" | "expense",
    amount: 0,
    categoryId: "",
    accountId: accounts[0]?.id || "",
    notes: "",
  });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickSaving(true);
    setQuickError(null);
    try {
      await addTransaction({
        ...quickForm,
        date: new Date().toISOString().split("T")[0],
      });
      setQuickOpen(false);
      setQuickForm({ type: "expense", amount: 0, categoryId: "", accountId: accounts[0]?.id || "", notes: "" });
    } catch (err: unknown) {
      setQuickError(err instanceof Error ? err.message : "Failed to add transaction");
    } finally {
      setQuickSaving(false);
    }
  };

  const quickCategories = categories.filter(c => c.type === quickForm.type);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const thisMonthTransactions = useMemo(
    () => transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }),
    [transactions, currentYear, currentMonth]
  );

  const monthlyIncome = useMemo(
    () => thisMonthTransactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [thisMonthTransactions]
  );

  const monthlyExpenses = useMemo(
    () => thisMonthTransactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [thisMonthTransactions]
  );

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + acc.balance, 0),
    [accounts]
  );

  const netSavings = monthlyIncome - monthlyExpenses;

  const activeGoalsCount = useMemo(
    () => savingsGoals.filter(g => g.targetAmount > 0 && g.savedAmount < g.targetAmount).length,
    [savingsGoals]
  );

  const upcomingBillsCount = useMemo(
    () => bills.filter(b => !b.paid && new Date(b.dueDate) >= now).length,
    [bills, now]
  );

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [transactions]
  );

  const activeGoals = useMemo(() => savingsGoals.slice(0, 3), [savingsGoals]);

  const expensesByCategory = useMemo(
    () => categories
      .filter(c => c.type === "expense")
      .map(cat => ({
        name: cat.name,
        value: transactions.filter(t => t.categoryId === cat.id && t.type === "expense").reduce((s, t) => s + t.amount, 0),
      }))
      .filter(c => c.value > 0),
    [categories, transactions]
  );

  const monthlyChartData = useMemo(() => {
    const last6Months: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      last6Months.push(monthNames[d.getMonth()]);
      const monthTxns = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
      });
      incomeData.push(monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0));
      expenseData.push(monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));
    }
    return { labels: last6Months, income: incomeData, expenses: expenseData };
  }, [transactions, currentYear, currentMonth]);

  const netWorthData = useMemo(() => {
    const last6Months: string[] = [];
    const values: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      last6Months.push(monthNames[d.getMonth()]);
      const balanceUpTo = accounts.reduce((sum, acc) => {
        const net = transactions
          .filter(t => {
            const td = new Date(t.date);
            return td <= d && t.accountId === acc.id;
          })
          .reduce((s, t) => s + (t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0), 0);
        return sum + acc.balance + net;
      }, 0);
      values.push(Math.round(balanceUpTo));
    }
    return { labels: last6Months, values };
  }, [accounts, transactions, currentYear, currentMonth]);

  const cashFlowOptions: ApexOptions = useMemo(() => ({
    chart: { type: "bar", fontFamily: "Outfit, sans-serif", height: 300, toolbar: { show: false } },
    colors: ["#10B981", "#EF4444"],
    plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 8 } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: monthlyChartData.labels },
    yaxis: { labels: { formatter: (val: number) => `₱${val / 1000}k` } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val: number) => formatCurrency(val) } },
    legend: { position: "top" as const, horizontalAlign: "left" as const },
  }), [monthlyChartData.labels]);

  const cashFlowSeries = useMemo(() => [
    { name: "Income", data: monthlyChartData.income },
    { name: "Expenses", data: monthlyChartData.expenses },
  ], [monthlyChartData]);

  const pieOptions: ApexOptions = useMemo(() => ({
    chart: { type: "donut", fontFamily: "Outfit, sans-serif", height: 300 },
    labels: expensesByCategory.map(c => c.name),
    colors: ["#465FFF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#06B6D4"],
    plotOptions: { pie: { donut: { size: "70%", labels: { show: true, total: { show: true, label: "Total Expenses", color: "#1F2937", fontSize: "16px", fontWeight: 600 } } } } },
    dataLabels: { enabled: false },
    legend: { position: "bottom" as const, fontSize: "12px" },
    tooltip: { y: { formatter: (val: number) => formatCurrency(val) } },
  }), [expensesByCategory]);

  const pieSeries = useMemo(() => expensesByCategory.map(c => c.value), [expensesByCategory]);

  const netWorthOptions: ApexOptions = useMemo(() => ({
    chart: { type: "area", fontFamily: "Outfit, sans-serif", height: 300, toolbar: { show: false } },
    colors: ["#465FFF"],
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0 } },
    stroke: { curve: "smooth" as const, width: 3 },
    dataLabels: { enabled: false },
    xaxis: { categories: netWorthData.labels },
    yaxis: { labels: { formatter: (val: number) => `₱${val / 1000}k` } },
    tooltip: { y: { formatter: (val: number) => formatCurrency(val) } },
    grid: { yaxis: { lines: { show: true } } },
  }), [netWorthData.labels]);

  const netWorthSeries = useMemo(() => [
    { name: "Net Worth", data: netWorthData.values },
  ], [netWorthData.values]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  const summaryCards = [
    { title: "Total Balance", value: formatCurrency(totalBalance), bg: "bg-brand-50 dark:bg-brand-500/10", icon: <WalletIcon className="text-brand-500" />, sub: `${accounts.length} accounts` },
    { title: "Monthly Income", value: formatCurrency(monthlyIncome), bg: "bg-success-50 dark:bg-success-500/10", icon: <ArrowUpIcon className="text-success-500" />, sub: `${thisMonthTransactions.filter(t => t.type === "income").length} transactions` },
    { title: "Monthly Expenses", value: formatCurrency(monthlyExpenses), bg: "bg-error-50 dark:bg-error-500/10", icon: <ArrowDownIcon className="text-error-500" />, sub: `${thisMonthTransactions.filter(t => t.type === "expense").length} transactions` },
    { title: "Net Savings", value: formatCurrency(netSavings), bg: "bg-blue-light-50 dark:bg-blue-light-500/10", icon: <PieChartIcon className="text-blue-light-500" />, sub: netSavings >= 0 ? "Positive" : "Deficit" },
    { title: "Active Goals", value: `${activeGoalsCount} goals`, bg: "bg-warning-50 dark:bg-warning-500/10", icon: <TargetIcon className="text-warning-500" />, sub: `${savingsGoals.length} total` },
    { title: "Upcoming Bills", value: `${upcomingBillsCount} bills`, bg: "bg-purple-50 dark:bg-purple-500/10", icon: <CalenderIcon className="text-purple-500" />, sub: "Due soon" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Balance — always visible */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${summaryCards[0].bg}`}>
              <span className="text-xl">{summaryCards[0].icon}</span>
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{summaryCards[0].title}</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{summaryCards[0].value}</h4>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">{summaryCards[0].sub}</span>
          </div>
        </div>
        {/* Rest — hidden on mobile */}
        {summaryCards.slice(1).map((item, idx) => (
          <div key={idx + 1} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hidden sm:block">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.bg}`}>
                <span className="text-xl">{item.icon}</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{item.title}</span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{item.value}</h4>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Income vs Expenses</h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Last 6 months</p>
          </div>
          {monthlyChartData.income.some(v => v > 0) || monthlyChartData.expenses.some(v => v > 0) ? (
            <ReactApexChart options={cashFlowOptions} series={cashFlowSeries} type="bar" height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
              No transaction data yet
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Spending by Category</h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Where your money goes</p>
          </div>
          {expensesByCategory.length > 0 ? (
            <ReactApexChart options={pieOptions} series={pieSeries} type="donut" height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">
              No expense data yet
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hidden sm:block">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Net Worth Trend</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Your financial growth</p>
        </div>
        <ReactApexChart options={netWorthOptions} series={netWorthSeries} type="area" height={300} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Transactions</h3>
            <Link href="/transactions" className="text-brand-500 text-sm font-medium hover:text-brand-600 flex items-center gap-1">
              View All <ArrowRightIcon />
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map(txn => {
                const category = categories.find(c => c.id === txn.categoryId);
                const account = accounts.find(a => a.id === txn.accountId);
                return (
                  <div key={txn.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-lg">
                        {category?.icon || "💰"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{txn.notes}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{category?.name} • {account?.name}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${txn.type === "income" ? "text-success-600" : "text-error-600"}`}>
                      {txn.type === "income" ? "+" : "-"}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p className="text-sm">No transactions yet</p>
              <Link href="/transactions/add" className="text-brand-500 text-sm hover:text-brand-600 mt-1 inline-block">Add your first transaction</Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] hidden sm:block">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Savings Goals</h3>
            <Link href="/savings-goals" className="text-brand-500 text-sm font-medium hover:text-brand-600 flex items-center gap-1">
              View All <ArrowRightIcon />
            </Link>
          </div>
          {activeGoals.length > 0 ? (
            <div className="space-y-5">
              {activeGoals.map(goal => {
                const progress = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">{goal.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatCurrency(goal.savedAmount)} saved</span>
                      <span>Goal: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p className="text-sm">No goals yet</p>
              <Link href="/savings-goals" className="text-brand-500 text-sm hover:text-brand-600 mt-1 inline-block">Create a savings goal</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB + Quick-Add Modal */}
      <button
        onClick={() => {
          setQuickForm({ type: "expense", amount: 0, categoryId: quickCategories[0]?.id || "", accountId: accounts[0]?.id || "", notes: "" });
          setQuickOpen(true);
        }}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <PlusIcon />
      </button>

      {quickOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={() => setQuickOpen(false)}>
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 max-h-[75vh] overflow-y-auto overscroll-contain p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Add Transaction</h3>
              <button onClick={() => setQuickOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            {quickError && (
              <div className="mb-4 rounded-lg border border-error-200 bg-error-50 p-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
                {quickError}
              </div>
            )}
            <form onSubmit={handleQuickAdd} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuickForm({ ...quickForm, type: "expense", categoryId: categories.filter(c => c.type === "expense")[0]?.id || "" });
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quickForm.type === "expense" ? "bg-error-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickForm({ ...quickForm, type: "income", categoryId: categories.filter(c => c.type === "income")[0]?.id || "" });
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quickForm.type === "income" ? "bg-success-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Income
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <CurrencyInput
                  value={quickForm.amount}
                  onChange={(val) => setQuickForm({ ...quickForm, amount: val })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90"
                  required
                  min={0.01}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={quickForm.categoryId}
                  onChange={e => {
                    const catId = e.target.value;
                    const cat = categories.find(c => c.id === catId);
                    setQuickForm({ ...quickForm, categoryId: catId, notes: cat ? cat.name : quickForm.notes });
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90 text-sm"
                  required
                >
                  <option value="">Select category</option>
                  {quickCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
                <select
                  value={quickForm.accountId}
                  onChange={e => setQuickForm({ ...quickForm, accountId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90 text-sm"
                  required
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={quickForm.notes}
                  onChange={e => setQuickForm({ ...quickForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-800 dark:text-white/90 text-sm"
                  placeholder="What was this for?"
                />
              </div>
              <button
                type="submit"
                disabled={quickSaving}
                className="w-full py-3 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {quickSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {quickSaving ? "Saving..." : `Add ${quickForm.type === "income" ? "Income" : "Expense"}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
