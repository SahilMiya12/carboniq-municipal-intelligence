"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  Search,
  Building,
  X,
  PieChart,
  Activity,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";
import { Ward } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [search, setSearch] = useState("");
  const [selectedWard, setSelectedWard] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWards = async () => {
    try {
      setIsLoading(true);
      const data = await api.getWards();
      setWards(data);
    } catch (err) {
      console.error("Failed to load wards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWards();
  }, []);

  const openWardDetail = async (wardId: number) => {
    try {
      const detail = await api.getWardDetail(wardId);
      setSelectedWard(detail);
    } catch (err) {
      console.error("Failed to load ward detail:", err);
    }
  };

  const filteredWards = wards.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      w.zone_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell
      title="Municipal Wards & Geographic Intensity"
      subtitle="Per-capita carbon accounting and district hotspot identification across 6 municipal zones"
      onRefresh={loadWards}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Search & Filter Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1410] border border-[#16271e] shadow-lg shadow-black/20"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ward name, code, or zone type..."
              className="w-full bg-[#060a08] border border-[#1a2d23] rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-400">
            Auditing <span className="text-emerald-400 font-bold">{filteredWards.length}</span> of {wards.length} Districts
          </div>
        </motion.div>

        {/* Ward Cards Grid with Stagger */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredWards.map((w) => {
            const isHotspot = w.per_capita_tco2e > 2.0;
            const intensityPct = Math.min(100, Math.round((w.per_capita_tco2e / 3.0) * 100));

            return (
              <motion.div
                key={w.id}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 350, damping: 25 } }}
                onClick={() => openWardDetail(w.id)}
                className="rounded-2xl bg-[#0b1410] border border-[#16271e] hover:border-emerald-500/50 p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xl shadow-black/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent group-hover:via-emerald-400 transition-all" />

                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                        {w.code}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2 group-hover:text-emerald-300 transition-colors">
                        {w.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isHotspot
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/35"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {isHotspot ? "Hotspot" : "Nominal"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2 mb-4">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span>{w.zone_type}</span>
                    <span className="text-slate-600">•</span>
                    <span>{w.area_sq_km} km²</span>
                  </div>

                  {/* Intensity Meter */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Per-Capita Load</span>
                      <span className="font-mono font-bold text-white">{formatNumber(w.per_capita_tco2e, 2)} kg/resident</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#14231b] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHotspot ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-gradient-to-r from-teal-400 to-emerald-500"
                        }`}
                        style={{ width: `${intensityPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#14231b]">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Gross Footprint</span>
                      <span className="text-lg font-bold font-mono text-white">
                        {formatNumber(w.total_emissions_tco2e, 1)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">tCO2e</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Population</span>
                      <span className="text-lg font-bold font-mono text-slate-300">
                        {w.population.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Users className="w-3.5 h-3.5 text-emerald-400/80" />
                    <span>Active District Census</span>
                  </div>
                  <span className="text-emerald-400 group-hover:text-emerald-300 font-semibold text-[11px] flex items-center gap-1">
                    Inspect <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Ward Detail Modal with AnimatePresence */}
        <AnimatePresence>
          {selectedWard && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="max-w-2xl w-full bg-[#0c1410] border border-[#1a2d23] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedWard(null)}
                  className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#15231c] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-emerald-400 font-bold">
                      {selectedWard.ward.code}
                    </span>
                    <h2 className="text-xl font-bold text-white">{selectedWard.ward.name}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#060a08] border border-[#16271e] mb-6">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Zone Type</span>
                    <span className="text-sm font-semibold text-white">{selectedWard.ward.zone_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Population</span>
                    <span className="text-sm font-semibold text-white">{selectedWard.ward.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Footprint</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatNumber(selectedWard.ward.total_emissions_tco2e, 1)} tCO2e
                    </span>
                  </div>
                </div>

                {/* Sector Breakdown */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <PieChart className="w-3.5 h-3.5 text-emerald-400" />
                    Sectoral Breakdown in this Ward
                  </h3>
                  <div className="space-y-2">
                    {selectedWard.sector_breakdown.map((s: any) => (
                      <div key={s.sector} className="flex items-center justify-between p-3 rounded-xl bg-[#0f1b15] border border-[#15271d]">
                        <span className="text-xs text-slate-300 font-medium">{s.sector}</span>
                        <span className="text-xs font-mono font-bold text-white">{s.tco2e} tCO2e</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Audited District Activity Events
                  </h3>
                  <div className="space-y-2">
                    {selectedWard.recent_activities.map((act: any) => (
                      <div key={act.id} className="p-3 rounded-xl bg-[#0f1b15] border border-[#15271d] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-medium text-slate-200">{act.activity}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{act.date} • {act.quantity}</div>
                        </div>
                        <span className="font-mono font-semibold text-emerald-300">
                          {act.emissions_tco2e} tCO2e
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardShell>
  );
}
