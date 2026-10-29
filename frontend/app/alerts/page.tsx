"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Check,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";
import { Alert } from "@/types/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAlerts(statusFilter || undefined, severityFilter || undefined);
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter]);

  const handleUpdateStatus = async (alertId: number, nextStatus: "acknowledged" | "resolved") => {
    try {
      await api.updateAlertStatus(alertId, nextStatus);
      loadAlerts();
    } catch (err) {
      console.error("Failed to update alert:", err);
    }
  };

  return (
    <DashboardShell
      title="Environmental Alerts & Surge Management"
      subtitle="Threshold breach events triggered by substation demand, traffic bottlenecks, and emissions spikes"
      onRefresh={loadAlerts}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Filter Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1410] border border-[#16271e] shadow-lg shadow-black/20"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </div>

            <div className="flex gap-1.5">
              {["", "active", "acknowledged", "resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    statusFilter === s
                      ? "bg-emerald-500 text-black font-bold shadow-md"
                      : "bg-[#060a08] text-slate-400 hover:text-white border border-[#1a2d23]"
                  }`}
                >
                  {s || "All Incidents"}
                </button>
              ))}
            </div>
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#060a08] border border-[#1a2d23] text-xs text-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical Severity</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </motion.div>

        {/* Alert Cards List with Stagger */}
        <motion.div variants={containerVariants} className="space-y-3">
          {alerts.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm rounded-2xl bg-[#0b1410] border border-[#16271e]">
              No alerts found matching the active criteria.
            </div>
          ) : (
            alerts.map((a) => (
              <motion.div
                key={a.id}
                variants={itemVariants}
                whileHover={{ y: -2, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                className={`p-5 rounded-2xl bg-[#0b1410] border transition-all ${
                  a.status === "active"
                    ? a.severity === "critical"
                      ? "border-rose-500/40 shadow-lg shadow-rose-950/20"
                      : "border-amber-500/35"
                    : "border-[#16271e] opacity-80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        a.severity === "critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : a.severity === "high"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      }`}
                    >
                      {a.severity}
                    </span>
                    <h3 className="text-sm font-bold text-white">{a.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-slate-400">
                      {new Date(a.timestamp).toLocaleString()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        a.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : a.status === "acknowledged"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">{a.message}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#14231b] text-xs">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>
                      District: <strong className="text-white">{a.ward_name}</strong>
                    </span>
                    <span>
                      Sector: <strong className="text-white">{a.sector_name}</strong>
                    </span>
                    <span>
                      Observed: <strong className="text-emerald-400 font-mono">{a.observed_value}</strong> vs Threshold: <strong className="text-slate-400 font-mono">{a.threshold_value}</strong>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {a.status === "active" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleUpdateStatus(a.id, "acknowledged")}
                        className="px-3 py-1.5 rounded-xl bg-[#12221a] hover:bg-[#182e23] border border-sky-500/30 text-sky-300 font-semibold text-[11px] transition-colors"
                      >
                        Acknowledge
                      </motion.button>
                    )}
                    {a.status !== "resolved" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleUpdateStatus(a.id, "resolved")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Resolved
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </DashboardShell>
  );
}
