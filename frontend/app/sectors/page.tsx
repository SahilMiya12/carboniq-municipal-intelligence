"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Zap,
  Bus,
  Trash2,
  Factory,
  BookOpen,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";
import { Sector } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [factors, setFactors] = useState<any[]>([]);

  useEffect(() => {
    api.getSectors().then((data) => {
      setSectors(data);
      if (data.length > 0) {
        setSelectedSectorId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSectorId) {
      api.getSectorFactors(selectedSectorId).then(setFactors);
    }
  }, [selectedSectorId]);

  const getSectorIcon = (code: string) => {
    const c = code.toLowerCase();
    if (c.includes("elec")) return Zap;
    if (c.includes("trans")) return Bus;
    if (c.includes("waste")) return Trash2;
    return Factory;
  };

  return (
    <DashboardShell
      title="Sectoral Decarbonization Intelligence"
      subtitle="Scope 1 & 2 carbon accounting across key municipal infrastructure systems"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Sector Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectors.map((s) => {
            const Icon = getSectorIcon(s.code);
            const isSelected = selectedSectorId === s.id;
            return (
              <motion.div
                key={s.id}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                onClick={() => setSelectedSectorId(s.id)}
                className={`p-5 rounded-2xl bg-[#0b1410] border cursor-pointer transition-all relative overflow-hidden shadow-xl shadow-black/20 ${
                  isSelected
                    ? "border-emerald-500 shadow-emerald-950/40 bg-gradient-to-b from-[#0f1d16] to-[#0b1410]"
                    : "border-[#16271e] hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {s.percentage}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{s.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">{s.description}</p>

                <div className="pt-3 border-t border-[#14231b] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Audited</span>
                    <span className="font-mono font-bold text-white">{formatNumber(s.total_emissions_tco2e, 1)} t</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Assurance Level</span>
                    <span className="text-emerald-300 font-semibold">{s.data_completeness_pct}% verified</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Selected Sector Methodology & Emission Factors */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/25">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Verified IPCC & EPA Emission Factors for Selected Sector
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#16271e] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Factor Name</th>
                  <th className="py-3 px-3">Numeric Coefficient</th>
                  <th className="py-3 px-3">Activity Unit</th>
                  <th className="py-3 px-3">Emission Unit</th>
                  <th className="py-3 px-3">Geography</th>
                  <th className="py-3 px-3">Citation & Standard</th>
                  <th className="py-3 px-3">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13221a]">
                {factors.map((f) => (
                  <tr key={f.id} className="hover:bg-[#101b15] transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-200">{f.name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-300">{f.value}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{f.activity_unit}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{f.emission_unit}</td>
                    <td className="py-3 px-3 text-slate-300">{f.geography}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{f.citation}</td>
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
