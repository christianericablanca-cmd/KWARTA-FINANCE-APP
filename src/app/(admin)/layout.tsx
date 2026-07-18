"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import MobileBottomNav from "@/layout/MobileBottomNav";
import AuthGuard from "@/components/AuthGuard";
import ClientOnly from "@/components/ClientOnly";
import React from "react";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <AuthGuard>
      <ClientOnly>
        <div className="min-h-screen xl:flex">
          <AppSidebar />
          <Backdrop />
          <div
            className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
          >
            <AppHeader />
            <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 pb-24 lg:pb-6">
              {children}
            </div>
          </div>
          <MobileBottomNav />
        </div>
      </ClientOnly>
    </AuthGuard>
  );
}
