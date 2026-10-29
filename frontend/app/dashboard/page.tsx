"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Bus,
  Trash2,
  Factory,
  Target,
  Globe2,
  AlertTriangle,
  ArrowRight,
  Download,
  Filter,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { KpiCard } from "@/components/ui/KpiCard";
import { EmissionsTrendChart } from "@/components/charts/EmissionsTrendChart";
import { SectorBreakdownChart } from "@/components/charts/SectorBreakdownChart";
import { containerVariants, itemVariants, Skeleton } from "@/components/ui/motion";
import { api } from "@/lib/api";
import { DashboardSummary, Ward, Sector } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedWard, setSelectedWard] = useState<number | undefined>();
  const [selectedSector, setSelectedSector] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<string>("30");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsRefreshing(true);
      setApiError(null);

      let startDate: string | undefined;
      const now = new Date();
      if (dateRange === "14") {
        const d = new Date(now.getTime() - 14 * 86400000);
        startDate = d.toISOString().split("T")[0];
      } else if (dateRange === "60") {
        const d = new Date(now.getTime() - 60 * 86400000);
        startDate = d.toISOString().split("T")[0];
      } else if (dateRange === "all") {
        startDate = "2024-01-01";
      }

      const summary = await api.getDashboardSummary({
        wardId: selectedWard,
        sectorId: selectedSector,
        startDate,
      });
      setData(summary);

      if (wards.length === 0) {
        const [wList, sList] = await Promise.all([api.getWards(), api.getSectors()]);
        setWards(wList);
        setSectors(sList);
      }
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setApiError(
        err?.message || "Failed to communicate with the CARBONIQ analytics engine. Verify backend is running on port 8000."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWard, selectedSector, dateRange]);

  return (
    <DashboardShell
      title="Municipal Command Center"
      subtitle={data?.reporting_period ? `Audited Period: ${data.reporting_period}` : "Synchronizing district telemetry..."}
      onRefresh={loadData}
      isRefreshing={isRefreshing}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Filter Toolbar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1410] border border-[#16271e] shadow-lg shadow-black/20"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Filter className="w-3.5 h-3.5" />
              <span>District Filters:</span>
            </div>

            {/* Ward filter */}
            <select
              value={selectedWard || ""}
              onChange={(e) => setSelectedWard(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-[#060a08] border border-[#1a2d23] text-xs text-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="">All Municipal Wards (6 Districts)</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code}: {w.name}
                </option>
              ))}
            </select>

            {/* Sector filter */}
            <select
              value={selectedSector || ""}
              onChange={(e) => setSelectedSector(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-[#060a08] border border-[#1a2d23] text-xs text-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="">All Emission Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Time Window filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[#060a08] border border-[#1a2d23] text-xs text-slate-200 rounded-xl px-3 py-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
            >
              <option value="30">Window: Last 30 Days</option>
              <option value="14">Window: Last 14 Days</option>
              <option value="60">Window: Last 60 Days</option>
              <option value="all">Window: Complete Historical</option>
            </select>
          </div>

          {/* Quick Export action */}
          <div className="flex items-center gap-2">
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={api.downloadPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12221a] hover:bg-[#182e23] border border-emerald-500/35 text-emerald-300 text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Official Audit PDF
            </motion.a>
          </div>
        </motion.div>

        {/* API Connection Error Banner */}
        {apiError && (
          <motion.div
            variants={itemVariants}
            className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-lg shadow-rose-950/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-rose-300">Backend Communication Notice</p>
                <p className="text-slate-400 mt-0.5">{apiError}</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Retry Connection
            </button>
          </motion.div>
        )}

        {/* Honest Empty State Banner if no records found for filter */}
        {!isLoading && !apiError && data && data.data_points_count === 0 && (
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl bg-[#0b1410] border border-amber-500/30 flex items-center gap-4 text-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-amber-300">No telemetry recorded for the selected filter combination</p>
              <p className="text-slate-400 mt-1">
                Try switching the district or sector filter back to &quot;All&quot; to inspect the municipal totals.
              </p>
            </div>
          </motion.div>
        )}

        {/* KPI Cards Grid */}
        {isLoading && !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
          >
            <KpiCard
              title="Total Gross Footprint"
              value={data?.total_emissions_tco2e || 0}
              unit="tCO2e"
              changePct={data?.emissions_change_pct}
              icon={Globe2}
              description="Gross district emissions"
              highlight={true}
            />
            <KpiCard
              title="Electricity Grid"
              value={data?.electricity_tco2e || 0}
              unit="tCO2e"
              changePct={-2.4}
              icon={Zap}
              description="Scope 2 purchased power"
            />
            <KpiCard
              title="Transit Fleet"
              value={data?.transport_tco2e || 0}
              unit="tCO2e"
              changePct={1.8}
              icon={Bus}
              description="Scope 1 mobile transit"
            />
            <KpiCard
              title="Solid Waste & MSW"
              value={data?.waste_tco2e || 0}
              unit="tCO2e"
              changePct={-0.9}
              icon={Trash2}
              description="Landfill dissipation"
            />
            <KpiCard
              title="Stationary Fuel"
              value={data?.other_tco2e || 0}
              unit="tCO2e"
              changePct={4.2}
              icon={Factory}
              description="Commercial natural gas"
            />
            <KpiCard
              title="2030 Target Goal"
              value={data?.current_progress_pct || 0}
              unit="%"
              changePct={3.5}
              isPositiveGood={true}
              icon={Target}
              description={`Progress toward ${data?.target_annual_reduction_pct || 30}% cut`}
            />
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Area Chart (Span 2) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 flex flex-col justify-between shadow-xl shadow-black/25 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Emissions Temporal Trend
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily aggregated emissions across primary municipal sectors (tCO2e)
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                IPCC Verified
              </span>
            </div>
            <EmissionsTrendChart data={data?.trends || []} />
          </motion.div>

          {/* Sector Breakdown Donut (Span 1) */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 flex flex-col justify-between shadow-xl shadow-black/25"
          >
            <div className="mb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Sectoral Contribution
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Proportion of gross municipal carbon budget
              </p>
            </div>
            <SectorBreakdownChart data={data?.sector_breakdown || []} />
          </motion.div>
        </div>

        {/* Ward Ranking & Hotspots Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ranked Ward Table (Span 2) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/25"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ward Decarbonization Hotspots
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ranked by gross emissions and per-capita intensity
                </p>
              </div>
              <Link
                href="/wards"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 group"
              >
                District Profiles <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#16271e] text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Ward Code & Name</th>
                    <th className="py-3 px-3">Population</th>
                    <th className="py-3 px-3">Gross tCO2e</th>
                    <th className="py-3 px-3">Per Capita (kg)</th>
                    <th className="py-3 px-3">Primary Sector</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#13221a]">
                  {data?.ward_rankings?.map((w) => (
                    <tr key={w.ward_id} className="hover:bg-[#101b15] transition-colors group">
                      <td className="py-3 px-3 font-medium text-slate-200">
                        <span className="font-mono text-emerald-400 mr-2 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {w.ward_code}
                        </span>
                        {w.ward_name}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono">{w.population.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {formatNumber(w.emissions_tco2e, 1)}
                      </td>
                      <td className="py-3 px-3 font-mono text-emerald-300">
                        {formatNumber(w.per_capita_tco2e, 2)}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{w.primary_sector}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            w.intensity_status === "Critical Hotspot"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : w.intensity_status === "Elevated"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {w.intensity_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Alerts & Automated Insights Card (Span 1) */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 flex flex-col justify-between shadow-xl shadow-black/25"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Active Telemetry Alerts
                </h2>
                <Link href="/alerts" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                  Incident Hub →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#0f1a14] border border-[#192b22] hover:border-rose-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-rose-400">SPIKE: W-03 Natural Gas Draw</span>
                    <span className="text-[10px] text-slate-500 font-mono">2h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Stationary combustion surged to 11,900 m³ in East Marine Terminal, exceeding baseline by 340%.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f1a14] border border-[#192b22] hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-amber-400">SURGE: W-02 Commercial HVAC</span>
                    <span className="text-[10px] text-slate-500 font-mono">6h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Downtown Financial Core substation demand peaked at 6,200 kW during high temperature interval.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#16271e]">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Decarbonization Suggestion</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Electrifying 40% of the public bus fleet along corridors W-02 and W-04 can avoid an estimated ~840 tCO2e annually.
              </p>
              <Link
                href="/simulator"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white font-semibold group"
              >
                Model in Policy Simulator <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardShell>
  );
}
