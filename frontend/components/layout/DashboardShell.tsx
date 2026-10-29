"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardShell({
  title,
  subtitle,
  children,
  onRefresh,
  isRefreshing,
}: DashboardShellProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen bg-[#060a08] text-slate-100">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AppHeader
          title={title}
          subtitle={subtitle}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <motion.main
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
