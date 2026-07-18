"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { BarChartIcon, PieChart1Icon, ArrowUpIcon, ArrowDownIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function formatCurrency(value: number) {
  return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  const { transactions, categories, loading } = useFinance();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const totalIncome = useMemo(
    () => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpenses = useMemo(
    () => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );

  const dayCount = useMemo(() => {
    const dates = new Set(transactions.map(t => t.date));
    return dates.size || 1;
  }, [transactions]);

  const averageDaily = totalExpenses / dayCount;

  const expenseByDay = useMemo(() => {
    const today = new Date();
    const last7Days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayTotal = transactions
        .filter(t => t.type === "expense" && t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      last7Days.push(dayTotal);
    }
    return last7Days;
  }, [transactions]);

  const expenseByWeek = useMemo(() => {
    const result: number[] = [];
    for (let w = 3; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const weekTotal = transactions
        .filter(t => {
          const d = new Date(t.date);
          return t.type === "expense" && d >= start && d <= end;
        })
        .reduce((s, t) => s + t.amount, 0);
      result.push(weekTotal);
    }
    return result;
  }, [transactions, now]);

  const expenseByMonth = useMemo(() => {
    const result: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(currentYear, currentMonth - i, 1);
      const monthTotal = transactions
        .filter(t => {
          const d = new Date(t.date);
          return t.type === "expense" && d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
        })
        .reduce((s, t) => s + t.amount, 0);
      result.push(monthTotal);
    }
    return result;
  }, [transactions, currentYear, currentMonth]);

  const monthLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(currentYear, currentMonth - i, 1);
      labels.push(monthNames[m.getMonth()]);
    }
    return labels;
  }, [currentYear, currentMonth]);

  const weekLabels = useMemo(() => {
    const labels: string[] = [];
    for (let w = 3; w >= 0; w--) {
      const end = new Date(now);
      end.setDate(end.getDate() - w * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      labels.push(`${start.getMonth() + 1}/${start.getDate()}`);
    }
    return labels;
  }, [now]);

  const categoryBreakdown = useMemo(
    () => categories
      .filter(c => c.type === "expense")
      .map(c => ({
        name: c.name,
        value: transactions.filter(t => t.categoryId === c.id && t.type === "expense").reduce((s, t) => s + t.amount, 0),
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value),
    [categories, transactions]
  );

  const dailyExpensesOptions: ApexOptions = useMemo(() => ({
    chart: { type: "bar", fontFamily: "Outfit, sans-serif", height: 300, toolbar: { show: false } },
    colors: ["#465FFF"],
    plotOptions: { bar: { borderRadius: 8, columnWidth: "60%" } },
    xaxis: { categories: dayNames },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val: number) => formatCurrency(val) } },
  }), []);

  const weeklyExpensesOptions: ApexOptions = useMemo(() => ({
    chart: { type: "line", fontFamily: "Outfit, sans-serif", height: 300, toolbar: { show: false } },
    colors: ["#10B981"],
    stroke: { curve: "smooth", width: 3 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0 } },
    xaxis: { categories: weekLabels },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val: number) => formatCurrency(val) } },
  }), [weekLabels]);

  const monthlyExpensesOptions: ApexOptions = useMemo(() => ({
    chart: { type: "area", fontFamily: "Outfit, sans-serif", height: 300, toolbar: { show: false } },
    colors: ["#F59E0B"],
    fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0 } },
    stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: monthLabels },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val: number) => formatCurrency(val) } },
  }), [monthLabels]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800" />
          <div className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Analytics</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into your spending patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Income", value: formatCurrency(totalIncome), sub: `${transactions.filter(t => t.type === "income").length} transactions`, icon: <ArrowUpIcon className="text-success-500" /> },
          { title: "Total Expenses", value: formatCurrency(totalExpenses), sub: `${transactions.filter(t => t.type === "expense").length} transactions`, icon: <ArrowDownIcon className="text-error-500" /> },
          { title: "Average Daily", value: formatCurrency(averageDaily), sub: `Over ${dayCount} days`, icon: <BarChartIcon className="text-brand-500" /> },
          { title: "Transactions", value: transactions.length.toString(), sub: "Total", icon: <PieChart1Icon className="text-warning-500" /> },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">{stat.value}</h4>
            <span className="text-xs text-gray-400 dark:text-gray-500">{stat.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Daily Spending</h3>
          {expenseByDay.some(v => v > 0) ? (
            <ReactApexChart options={dailyExpensesOptions} series={[{ name: "Expenses", data: expenseByDay }]} type="bar" height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">No data this week</div>
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Weekly Spending Trend</h3>
          {expenseByWeek.some(v => v > 0) ? (
            <ReactApexChart options={weeklyExpensesOptions} series={[{ name: "Expenses", data: expenseByWeek }]} type="line" height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">No weekly data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Monthly Spending Trend</h3>
          {expenseByMonth.some(v => v > 0) ? (
            <ReactApexChart options={monthlyExpensesOptions} series={[{ name: "Expenses", data: expenseByMonth }]} type="area" height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">No monthly data yet</div>
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Category Breakdown</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500">No expense data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
