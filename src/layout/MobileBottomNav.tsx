"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, RowIcon, PlusIcon, WalletIcon, BoxArchiveIcon } from "@/icons";

const navItems = [
  { href: "/", icon: <GridIcon />, label: "Home" },
  { href: "/transactions", icon: <RowIcon />, label: "Transactions" },
  { href: "/transactions/add", icon: <PlusIcon />, label: "Add" },
  { href: "/accounts", icon: <WalletIcon />, label: "Accounts" },
  { href: "/bills", icon: <BoxArchiveIcon />, label: "Bills" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const isAdd = item.label === "Add";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-0 ${
                isAdd
                  ? "-mt-5"
                  : ""
              }`}
            >
              {isAdd ? (
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-500 text-white shadow-lg">
                  <span className="text-lg">{item.icon}</span>
                </span>
              ) : (
                <>
                  <span className={`w-6 h-6 flex items-center justify-center ${
                    isActive ? "text-brand-500" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {item.icon}
                  </span>
                  <span className={`text-xs font-medium ${
                    isActive ? "text-brand-500" : "text-gray-400 dark:text-gray-500"
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
