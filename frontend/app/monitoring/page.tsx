"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Play,
  Pause,
  PlusCircle,
  Radio,
  Clock,
  Gauge,
  AlertTriangle,
  Cpu,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";
import { MonitoringStatus } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function MonitoringPage() {
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pollInterval, setPollInterval] = useState(3000);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsRefreshing(true);
      const data = await api.getMonitoringStatus();
      setStatus(data);
      setIsRunning(data.is_simulation_running);
    } catch (err) {
      console.error("Failed to fetch monitoring telemetry:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval]);

  const handleToggleSimulation = async () => {
    try {
      const nextAction = isRunning ? "stop" : "start";
      await api.controlSimulation(nextAction, 5);
      setIsRunning(!isRunning);
      setActionMessage(nextAction === "start" ? "Stream Resumed (5s interval)" : "Stream Paused");
      setTimeout(() => setActionMessage(null), 2500);
      fetchStatus();
    } catch (err) {
      console.error("Simulation toggle failed:", err);
    }
  };

  const handleStepSimulation = async () => {
    try {
      await api.controlSimulation("step");
      setActionMessage("Generated Simulated Telemetry Event");
      setTimeout(() => setActionMessage(null), 2000);
      fetchStatus();
    } catch (err) {
      console.error("Manual step generation failed:", err);
    }
  };

  return (
    <DashboardShell
      title="High-Frequency Telemetry Stream"
      subtitle="Real-time IoT stream ingestion across municipal electrical substations, transit fleets, and waste stations"
      onRefresh={fetchStatus}
      isRefreshing={isRefreshing}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Stream Banner & Controls */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl bg-[#0b1410] border border-[#16271e] flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/20 relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <span className={`absolute inline-flex h-12 w-12 rounded-full ${isRunning ? "bg-emerald-500/20 animate-ping" : "bg-slate-700/20"}`} />
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 relative z-10 shadow-lg shadow-emerald-950">
                <Radio className={`w-6 h-6 ${isRunning ? "text-emerald-400" : "text-slate-500"}`} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">
                  District Telemetry Engine
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isRunning
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {isRunning ? "Streaming (5s Cadence)" : "Paused"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Persisting simulated IoT feeds to PostgreSQL / SQLite and feeding real-time ML anomaly detection.
              </p>
            </div>
          </div>

          {/* Action Controls with Motion */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleSimulation}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isRunning
                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Telemetry Stream
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume Live Telemetry
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStepSimulation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#12221a] hover:bg-[#182e23] border border-emerald-500/30 text-slate-200 text-xs font-semibold transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Generate Single Reading
            </motion.button>
          </div>
        </motion.div>

        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </motion.div>
        )}

        {/* Real-time Rate Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Instantaneous Rate</span>
              <Gauge className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {formatNumber(status?.current_emissions_rate_tco2e_hr || 0, 3)}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">tCO2e / hr</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">5-event sliding rolling mean</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Events Ingested</span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {(status?.total_events_buffered || 0).toLocaleString()}
              </span>
              <span className="text-xs text-slate-400">records</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Persisted in municipal database</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Threshold Incidents</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                {status?.active_alerts_count || 0}
              </span>
              <span className="text-xs text-slate-400">unresolved</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Triggered by spike/surge readings</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Last Ingestion</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3 text-base font-mono font-bold text-slate-200 truncate">
              {status?.last_event_time ? new Date(status.last_event_time).toLocaleTimeString() : "Awaiting..."}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Ingestion health nominal</p>
          </motion.div>
        </motion.div>

        {/* Live Stream Table */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/25">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Real-Time Telemetry Event Log
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit feed of district sensor readings with automated threshold classification
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#16271e] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Ward</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">Telemetry Metric</th>
                  <th className="py-3 px-3">Value</th>
                  <th className="py-3 px-3">Emission Rate (kg/hr)</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13221a]">
                {status?.recent_telemetry?.map((e) => (
                  <tr key={e.id} className="hover:bg-[#101b15] transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">{e.ward_name}</td>
                    <td className="py-3 px-3 text-slate-400">{e.sector_name}</td>
                    <td className="py-3 px-3 text-slate-300">{e.metric_name}</td>
                    <td className="py-3 px-3 font-mono text-white font-semibold">
                      {e.value} <span className="text-[10px] text-slate-500 font-normal">{e.unit}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                      {formatNumber(e.emissions_rate_kg_hr, 1)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          e.status === "SPIKE"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                            : e.status === "SURGE"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : e.status === "ELEVATED"
                            ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </DashboardShell>
  );
}
