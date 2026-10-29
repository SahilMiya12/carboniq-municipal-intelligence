"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  AlertTriangle,
  Cpu,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ForecastChart } from "@/components/charts/ForecastChart";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";
import { AnomalyResponse, ForecastResponse } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function ForecastingPage() {
  const [horizon, setHorizon] = useState(14);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMLData = async () => {
    try {
      setIsLoading(true);
      const [fData, aData] = await Promise.all([
        api.getForecast(horizon),
        api.getAnomalies(60),
      ]);
      setForecast(fData);
      setAnomalies(aData);
    } catch (err) {
      console.error("Failed to load ML models:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMLData();
  }, [horizon]);

  return (
    <DashboardShell
      title="Machine Learning & Anomaly Intelligence"
      subtitle="Unsupervised Isolation Forest anomaly detection and regularized autoregressive emissions forecasting"
      onRefresh={loadMLData}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Model Performance Stats */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Model MAE</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {formatNumber(forecast?.mae || 0, 3)}
              </span>
              <span className="text-xs text-slate-400">tCO2e</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Baseline Naive: {formatNumber(forecast?.baseline_mae || 0, 3)} tCO2e
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Model RMSE</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                {formatNumber(forecast?.rmse || 0, 3)}
              </span>
              <span className="text-xs text-slate-400">tCO2e</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">80/20 chronological train/test split</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Detected Anomalies</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-amber-400">
                {anomalies?.total_anomalies_detected || 0}
              </span>
              <span className="text-xs text-slate-400">outliers</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Isolation Forest (5% contamination)</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e]">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span>Projection Horizon</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-purple-400">{horizon}</span>
              <span className="text-xs text-slate-400">days forward</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">95% statistical confidence interval</p>
          </motion.div>
        </motion.div>

        {/* Forecasting Chart Card */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/25">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Municipal Emissions Predictive Trajectory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Autoregressive Ridge Regression with lag-7 seasonality and calendar trend features
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#060a08] border border-[#1a2d23] p-1 rounded-xl">
              {[7, 14, 30].map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    horizon === h
                      ? "bg-emerald-500 text-black shadow-md font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {h} Days
                </button>
              ))}
            </div>
          </div>

          <ForecastChart
            historical={forecast?.historical_points || []}
            projected={forecast?.projected_points || []}
          />
        </motion.div>

        {/* Isolation Forest Anomaly Detection Table */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/25">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Isolation Forest Anomaly Registry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {anomalies?.criteria_explanation}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#16271e] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Ward</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">Observed (tCO2e)</th>
                  <th className="py-3 px-3">Baseline</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Anomaly Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13221a]">
                {anomalies?.anomalies?.map((a) => (
                  <tr key={a.id} className="hover:bg-[#101b15] transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">{a.date}</td>
                    <td className="py-3 px-3 font-medium text-slate-200">{a.ward_name}</td>
                    <td className="py-3 px-3 text-slate-400">{a.sector_name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">{a.observed_value}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{a.expected_value}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          a.severity === "critical"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            : a.severity === "high"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px] max-w-md leading-relaxed">{a.explanation}</td>
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
