import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { FinanceProvider } from '@/context/FinanceContext';
import type { Metadata } from 'next';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kwarta — Personal Finance App",
  description: "Track accounts, transactions, bills, and budgets. Your all-in-one personal finance dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <FinanceProvider>
              {children}
            </FinanceProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
