"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  Info,
  Zap,
  Bus,
  Trash2,
  Factory,
  ArrowRight,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants, AnimatedNumber } from "@/components/ui/motion";
import { api } from "@/lib/api";
import { PolicySimulationResponse } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function SimulatorPage() {
  const [elecReduction, setElecReduction] = useState(15);
  const [renewableShare, setRenewableShare] = useState(30);
  const [busElectrification, setBusElectrification] = useState(40);
  const [wasteDiversion, setWasteDiversion] = useState(25);
  const [indEfficiency, setIndEfficiency] = useState(10);

  const [simulation, setSimulation] = useState<PolicySimulationResponse | null>(null);
  const [scenarioName, setScenarioName] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async () => {
    try {
      setIsLoading(true);
      const res = await api.runPolicySimulation({
        electricity_reduction_pct: elecReduction,
        renewable_share_pct: renewableShare,
        bus_electrification_pct: busElectrification,
        waste_diversion_pct: wasteDiversion,
        industrial_efficiency_pct: indEfficiency,
      });
      setSimulation(res);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [elecReduction, renewableShare, busElectrification, wasteDiversion, indEfficiency]);

  const handleSaveScenario = async () => {
    if (!scenarioName.trim()) return;
    try {
      await api.saveScenario(scenarioName, {
        electricity_reduction_pct: elecReduction,
        renewable_share_pct: renewableShare,
        bus_electrification_pct: busElectrification,
        waste_diversion_pct: wasteDiversion,
        industrial_efficiency_pct: indEfficiency,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      setScenarioName("");
    } catch (err) {
      console.error("Failed to save scenario:", err);
    }
  };

  const getSectorIcon = (name: string) => {
    if (name.includes("Electricity")) return Zap;
    if (name.includes("Transportation")) return Bus;
    if (name.includes("Waste")) return Trash2;
    return Factory;
  };

  return (
    <DashboardShell
      title="Decarbonization Policy & What-If Simulator"
      subtitle="Model municipal carbon abatement interventions with dynamic IPCC-calibrated marginal response curves"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column (Span 1) */}
          <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 space-y-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Policy Levers & Interventions
              </h2>
            </div>

            {/* Lever 1 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Commercial Energy Efficiency</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {elecReduction}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={elecReduction}
                onChange={(e) => setElecReduction(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">Municipal building retrofits & LED smart lighting</p>
            </div>

            {/* Lever 2 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Renewable Grid Generation</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {renewableShare}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={renewableShare}
                onChange={(e) => setRenewableShare(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">Rooftop solar and power purchase agreements (PPA)</p>
            </div>

            {/* Lever 3 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Transit Bus Electrification</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {busElectrification}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={busElectrification}
                onChange={(e) => setBusElectrification(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">Zero-emission electric buses replacing diesel fleet</p>
            </div>

            {/* Lever 4 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Landfill Waste Diversion</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {wasteDiversion}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={wasteDiversion}
                onChange={(e) => setWasteDiversion(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">Organics composting and methane capture systems</p>
            </div>

            {/* Lever 5 */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Stationary Boiler Efficiency</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {indEfficiency}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={indEfficiency}
                onChange={(e) => setIndEfficiency(Number(e.target.value))}
                className="w-full cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-1">Industrial heat recovery and building insulation</p>
            </div>

            {/* Save Scenario Form */}
            <div className="pt-4 border-t border-[#16271e]">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Save Policy Scenario
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g. 2030 Fast Track"
                  className="flex-1 bg-[#060a08] border border-[#1a2d23] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveScenario}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </motion.button>
              </div>
              {savedSuccess && (
                <p className="text-emerald-400 text-[11px] mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Scenario archived to database!
                </p>
              )}
            </div>
          </motion.div>

          {/* Results Column (Span 2) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {/* Executive Abatement Cards with Animated Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#0b1410] border border-emerald-500/35 shadow-xl shadow-black/20 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Estimated Abatement
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-emerald-400">
                    -<AnimatedNumber value={simulation?.net_savings_tco2e || 0} decimals={0} />
                  </span>
                  <span className="text-xs text-emerald-300 font-semibold">tCO2e / yr</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Annual absolute reduction</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e] shadow-xl shadow-black/20">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Relative Cut
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    <AnimatedNumber value={simulation?.percentage_reduction || 0} decimals={1} />%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">reduction</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Versus district baseline</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0b1410] border border-[#16271e] shadow-xl shadow-black/20">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Target Contribution
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-teal-300">
                    <AnimatedNumber value={simulation?.target_contribution_pct || 0} decimals={1} />%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">of 2030 goal</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Toward municipal reduction target</p>
              </div>
            </div>

            {/* Sector Impacts Breakdown with Meters */}
            <div className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/25">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                Sector-by-Sector Abatement Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {simulation?.sector_impacts?.map((sec) => {
                  const Icon = getSectorIcon(sec.sector_name);
                  return (
                    <div key={sec.sector_name} className="p-4 rounded-xl bg-[#080e0b] border border-[#14231b]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white">{sec.sector_name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          -{sec.reduction_pct}%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#121f18] text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Baseline</span>
                          <span className="font-mono text-slate-300">{formatNumber(sec.baseline_tco2e, 0)}t</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Simulated</span>
                          <span className="font-mono text-slate-200">{formatNumber(sec.simulated_tco2e, 0)}t</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Net Saved</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {formatNumber(sec.saved_tco2e, 0)}t
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scientific Methodology Note */}
            <div className="p-4 rounded-xl bg-[#080e0b] border border-emerald-500/20 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2">
                <Info className="w-4 h-4" />
                Methodological Assumptions & Marginals
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
                {simulation?.assumptions?.map((assump, idx) => (
                  <li key={idx}>{assump}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardShell>
  );
}
