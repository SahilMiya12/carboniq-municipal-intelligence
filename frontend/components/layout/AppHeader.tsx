"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, RefreshCw, Calendar, Radio } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AppHeader({ title, subtitle, onRefresh, isRefreshing }: AppHeaderProps) {
  return (
    <header className="h-16 px-6 lg:px-8 border-b border-[#14231b] bg-[#070b09]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-30">
      <div className="flex flex-col min-w-0 pr-4">
        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Real-time simulation status pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0c1611] border border-[#1a2d23] text-xs shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-300 font-medium text-[11px] tracking-wide">
            Telemetry Stream Live
          </span>
        </div>

        {/* Date period indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c1611] border border-[#1a2d23] text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-emerald-400/80" />
          <span className="font-mono text-[11px]">Audit Window: 30D Rolling</span>
        </div>

        {/* Refresh Action with Motion */}
        {onRefresh && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#0c1611] hover:bg-[#13221b] border border-[#1a2d23] text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh live data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
          </motion.button>
        )}
      </div>
    </header>
  );
}
