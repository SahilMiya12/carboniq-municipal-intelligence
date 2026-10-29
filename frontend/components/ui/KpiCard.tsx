"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber, itemVariants } from "./motion";

interface KpiCardProps {
  title: string;
  value: number;
  unit: string;
  changePct?: number | null;
  changeLabel?: string;
  icon: LucideIcon;
  description?: string;
  isPositiveGood?: boolean; // In emissions, decrease is GOOD (green)
  highlight?: boolean;
}

export function KpiCard({
  title,
  value,
  unit,
  changePct,
  changeLabel = "vs last cycle",
  icon: Icon,
  description,
  isPositiveGood = false,
  highlight = false,
}: KpiCardProps) {
  const hasChange = changePct !== undefined && changePct !== null;
  const isDecreased = hasChange && changePct < 0;
  const isIncreased = hasChange && changePct > 0;

  // In emissions, negative change is favorable (green)
  const isGood = isPositiveGood ? isIncreased : isDecreased;
  const isBad = isPositiveGood ? isDecreased : isIncreased;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
      className={cn(
        "group relative rounded-2xl bg-[#0c1410] border p-5 flex flex-col justify-between transition-all duration-300 overflow-hidden",
        highlight
          ? "border-emerald-500/50 shadow-lg shadow-emerald-950/40 bg-gradient-to-b from-[#0f1c15] to-[#0c1410]"
          : "border-[#17271f] hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/20"
      )}
    >
      {/* Subtle top luminous ambient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
            {title}
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#13221b] border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/40 group-hover:text-emerald-300 transition-all shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
            <AnimatedNumber value={value} decimals={value > 999 ? 0 : value > 100 ? 1 : 2} />
          </span>
          <span className="text-xs font-semibold text-emerald-400/90 tracking-wide">{unit}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#14231b] flex items-center justify-between text-xs">
        {hasChange ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
              isGood
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                : isBad
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            )}
          >
            {isDecreased ? (
              <TrendingDown className="w-3 h-3 text-emerald-400" />
            ) : isIncreased ? (
              <TrendingUp className="w-3 h-3 text-amber-400" />
            ) : (
              <Minus className="w-3 h-3 text-slate-400" />
            )}
            {Math.abs(changePct)}%
          </span>
        ) : (
          <span className="text-[11px] text-slate-500">Baseline nominal</span>
        )}

        <span className="text-[11px] text-slate-500 truncate max-w-[120px] text-right">
          {description || changeLabel}
        </span>
      </div>
    </motion.div>
  );
}
