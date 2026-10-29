"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Database,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { containerVariants, itemVariants } from "@/components/ui/motion";
import { api } from "@/lib/api";

export default function DataManagementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const loadRecords = async () => {
    try {
      const data = await api.getActivityRecords(20, 0);
      setRecords(data.records);
      setTotalRecords(data.total);
    } catch (err) {
      console.error("Failed to load records:", err);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);
    setUploadResult(null);

    try {
      const result = await api.uploadFile(file);
      setUploadResult(result);
      loadRecords();
      setFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardShell
      title="Municipal Data Workspace"
      subtitle="Audited telemetry ingestion, CSV/Excel batch upload, and data quality validation"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Zone (Span 2) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Batch Ingestion Workspace
              </h2>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"}/data/example-csv`}
                download
                className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Template CSV
              </a>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-[#1a2d23] hover:border-emerald-500/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-colors bg-[#060a08]/60 cursor-pointer"
            >
              <FileSpreadsheet className="w-12 h-12 text-emerald-400/60 mb-3" />
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop activity CSV or Excel (.xlsx) file
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Verified activity dimensions: Electricity (kWh), Fleet (vehicle-km), Waste (tonnes), Stationary Fuel (m³)
              </p>

              <input
                type="file"
                id="file-input"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="mt-4 px-4 py-2 rounded-xl bg-[#12221a] hover:bg-[#182e23] border border-emerald-500/35 text-emerald-300 text-xs font-semibold cursor-pointer transition-all"
              >
                Browse Local Files
              </label>

              {file && (
                <div className="mt-4 p-3 rounded-xl bg-[#0f1b15] border border-[#1a2d23] text-xs text-slate-300 flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-medium text-white">{file.name}</span>
                  <span className="text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {file && (
              <div className="mt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isUploading ? "Validating & Ingesting..." : "Run Carbon Audit & Ingest"}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {uploadResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-[#091510] border border-emerald-500/35"
              >
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Ingestion Verified & Persisted
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Audited:</span>
                    <span className="font-mono font-bold text-white">
                      {uploadResult.validation_summary.total_rows}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accepted:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {uploadResult.validation_summary.valid_rows}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Duplicates:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {uploadResult.validation_summary.duplicate_rows}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rejected:</span>
                    <span className="font-mono font-bold text-rose-400">
                      {uploadResult.validation_summary.rejected_rows}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Guidelines Card (Span 1) */}
          <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 flex flex-col justify-between shadow-xl shadow-black/20">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Data Verification Pipeline
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Activity batches are validated against ISO 14064-1 verification constraints before storage.
              </p>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Unit dimensionality normalization (e.g., MWh → kWh, gallon → L)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Deduplication against existing timestamp signatures</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ward code & boundary geo-verification</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#14231b]">
              <span className="text-xs text-slate-500">Database Persistence:</span>
              <div className="font-mono font-bold text-white text-base mt-1">
                {totalRecords.toLocaleString()} Verified Records
              </div>
            </div>
          </motion.div>
        </div>

        {/* Records Table */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-[#0b1410] border border-[#16271e] p-6 shadow-xl shadow-black/25">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Audited Municipal Activity Ledger
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#16271e] text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Ward</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">Activity Type</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Emissions (tCO2e)</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#13221a]">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-[#101b15] transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400">{r.date}</td>
                    <td className="py-3 px-3 font-medium text-slate-200">{r.ward}</td>
                    <td className="py-3 px-3 text-slate-400">{r.sector}</td>
                    <td className="py-3 px-3 text-slate-300">{r.activity}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{r.quantity}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{r.emissions_tco2e}</td>
                    <td className="py-3 px-3 text-slate-400">{r.source}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/25">
                        {r.status}
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
