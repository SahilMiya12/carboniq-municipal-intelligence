"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";

export default function ReportsPage() {
  return (
    <DashboardShell
      title="Municipal Carbon Audit & Compliance Reports"
      subtitle="Export formal GHG inventories compliant with ISO 14064-1 and Global Protocol for Cities (GPC)"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* PDF Report Generation Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-[#0b1410] border border-emerald-500/35 p-6 flex flex-col justify-between shadow-xl shadow-black/20 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Official Municipal Carbon Audit (PDF)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Formal verification report detailing district gross footprint, Scope 1 and Scope 2 totals, ward hotspots, and IPCC emission factor citations.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Executive Summary & Scope Totals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ward Hotspot Ranking & Per-Capita Breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Third-Party Verification & Citation Log</span>
              </li>
            </ul>
          </div>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={api.downloadPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            Generate & Download Audit PDF
          </motion.a>
        </motion.div>

        {/* CSV Data Export Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 flex flex-col justify-between shadow-xl shadow-black/20"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Audited Activity Records Export (CSV)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Raw tabular data stream containing every audited activity record with normalized activity quantities, emission factors, and quality flags.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>All 1,100+ Persisted Activity Records</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Compatible with Tableau, PowerBI, Python</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Raw kgCO2e and tCO2e Conversions</span>
              </li>
            </ul>
          </div>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={api.downloadCsvUrl}
            download="carboniq_municipal_emissions_report.csv"
            className="w-full py-2.5 px-4 rounded-xl bg-[#12221a] hover:bg-[#182e23] border border-emerald-500/35 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Complete CSV
          </motion.a>
        </motion.div>

        {/* Verification Assurance Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 flex flex-col justify-between shadow-xl shadow-black/20"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Carbon Accounting Protocols
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All reporting adheres to the standard Greenhouse Gas Protocol for Cities (GPC).
            </p>
            <div className="p-3.5 rounded-xl bg-[#060a08] border border-[#14231b] text-xs text-slate-300 space-y-2 mb-4">
              <div>
                <strong className="text-white block">Scope 1 Direct:</strong>
                <span className="text-slate-400 text-[11px]">Municipal diesel buses, landfill methane, boilers.</span>
              </div>
              <div>
                <strong className="text-white block">Scope 2 Indirect:</strong>
                <span className="text-slate-400 text-[11px]">Substation purchased grid power draw.</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 text-center font-mono">
            Certified ISO 14064-1 Assurance
          </div>
        </motion.div>
      </motion.div>
    </DashboardShell>
  );
}
