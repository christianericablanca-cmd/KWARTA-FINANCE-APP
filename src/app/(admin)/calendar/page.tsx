"use client";

import React, { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { CalenderIcon, ChevronLeftIcon, ChevronRightIcon } from "@/icons";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function CalendarPage() {
  const { transactions, bills, loading } = useFinance();

  const today = new Date();
  const [viewDate, setViewDate] = React.useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const { month: currentMonth, year: currentYear } = viewDate;

  const [selectedDate, setSelectedDate] = React.useState(
    `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
  );

  const prevMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const nextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) return { month: 0, year: prev.year + 1 };
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const activityByDate = useMemo(() => {
    const map: Record<string, { count: number; transactions: typeof transactions; bills: typeof bills }> = {};
    for (const t of transactions) {
      const key = t.date;
      if (!map[key]) map[key] = { count: 0, transactions: [], bills: [] };
      map[key].count++;
      map[key].transactions.push(t);
    }
    for (const b of bills) {
      const key = b.dueDate;
      if (!map[key]) map[key] = { count: 0, transactions: [], bills: [] };
      map[key].count++;
      map[key].bills.push(b);
    }
    return map;
  }, [transactions, bills]);

  const getActivityForDate = (day: number) => {
    const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
    return activityByDate[dateStr] || { transactions: [], bills: [], count: 0 };
  };

  const selectedActivities = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateStr = `${y}-${pad(m)}-${pad(d)}`;
    return activityByDate[dateStr] || { transactions: [], bills: [], count: 0 };
  }, [selectedDate, activityByDate]);

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">Calendar</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View transactions and bills by date</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">{monthLabel}</h3>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const activities = getActivityForDate(day);
              const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
              const isSelected = selectedDate === dateStr;
              const isToday = currentMonth === today.getMonth() && currentYear === today.getFullYear() && day === today.getDate();
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 relative transition-colors ${isSelected ? "bg-brand-500 text-white" : isToday ? "border-2 border-brand-500 text-gray-800 dark:text-white/90" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {activities.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"}`}>
                      {activities.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {(() => {
              try {
                return new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
              } catch {
                return selectedDate;
              }
            })()}
          </h3>
          <div className="space-y-3">
            {selectedActivities.transactions.length === 0 && selectedActivities.bills.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No activities on this date</p>
            ) : (
              <>
                {selectedActivities.transactions.map(txn => (
                  <div key={txn.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{txn.notes}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{txn.type}</p>
                    </div>
                    <span className={`text-sm font-semibold ${txn.type === "income" ? "text-success-600" : "text-error-600"}`}>
                      {txn.type === "income" ? "+" : "-"}₱{txn.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
                {selectedActivities.bills.map(bill => (
                  <div key={bill.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{bill.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bill due</p>
                    </div>
                    <span className="text-sm font-semibold text-warning-600">₱{bill.amount.toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
