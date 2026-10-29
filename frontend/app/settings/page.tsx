"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building,
  Save,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [muniName, setMuniName] = useState("Metropolis Smart District");
  const [targetPct, setTargetPct] = useState(30.0);
  const [targetYear, setTargetYear] = useState(2030);
  const [factors, setFactors] = useState<any[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getSettings().then((res) => {
      if (res.municipality) {
        setMuniName(res.municipality.name);
        setTargetPct(res.municipality.baseline_target_pct);
        setTargetYear(res.municipality.target_year);
      }
      if (res.emission_factors) {
        setFactors(res.emission_factors);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateMunicipality({
        municipality_name: muniName,
        baseline_target_pct: targetPct,
        target_year: targetYear,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  return (
    <DashboardShell
      title="Platform & Municipal Settings"
      subtitle="Administrative configuration for decarbonization goals, baseline years, and verified emission factors"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* District Configuration Form (Span 1) */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              District Targets & Profile
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">
                Municipality / District Name
              </label>
              <input
                type="text"
                value={muniName}
                onChange={(e) => setMuniName(e.target.value)}
                className="w-full bg-[#060a08] border border-[#1a2d23] rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">
                Baseline Carbon Reduction Target (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value))}
                className="w-full bg-[#060a08] border border-[#1a2d23] rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5">
                Target Compliance Year
              </label>
              <input
                type="number"
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full bg-[#060a08] border border-[#1a2d23] rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              Save Municipal Configuration
            </motion.button>

            {savedSuccess && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-400 text-[11px] text-center flex items-center justify-center gap-1 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Settings updated successfully
              </motion.p>
            )}
          </form>
        </motion.div>

        {/* Emission Factors Reference Table (Span 2) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              System Emission Factors Library
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#16271e] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Factor Name</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">Coefficient</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3">Citation Standard</th>
                  <th className="py-3 px-3">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13221a]">
                {factors.map((f) => (
                  <tr key={f.id} className="hover:bg-[#101b15] transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-200">{f.factor_name}</td>
                    <td className="py-3 px-3 text-slate-400">{f.sector}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-300">{f.numeric_value}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{f.activity_unit}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{f.source_citation}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {f.version}
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
