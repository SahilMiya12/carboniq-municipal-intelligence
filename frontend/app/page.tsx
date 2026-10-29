"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Activity,
  TrendingUp,
  Sliders,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { containerVariants, itemVariants } from "@/components/ui/motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060a08] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="h-20 px-8 max-w-7xl w-full mx-auto flex items-center justify-between border-b border-[#14231b]/80 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 flex items-center justify-center text-black font-bold shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-white tracking-wider">
              CARBON<span className="text-emerald-400">IQ</span>
            </span>
            <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              Smart City Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5"
          >
            Staff Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-md shadow-emerald-500/25"
            >
              Launch Console
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl w-full mx-auto px-6 py-20 flex-1 flex flex-col justify-center text-center items-center relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-sm shadow-emerald-950"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Real-Time Municipal Carbon Analytics Engine v2.4</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.12]"
          >
            A Data-Driven Framework for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
              Real-Time Monitoring
            </span>{" "}
            of Municipal Carbon Footprints
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed"
          >
            High-frequency IoT telemetry ingestion, IPCC Scope 1 & 2 carbon accounting, Isolation Forest anomaly isolation, and forward predictive forecasting tailored for sustainable smart cities.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all shadow-xl shadow-emerald-500/25"
              >
                Open Command Center
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/monitoring"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0c1611] hover:bg-[#13221b] border border-[#1a2d23] text-slate-200 font-semibold text-sm transition-all"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Telemetry Stream
              </Link>
            </motion.div>
          </motion.div>

          {/* Highlight Grid with Stagger */}
          <motion.div
            variants={containerVariants}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-[#0b1410] border border-[#16271e] hover:border-emerald-500/40 transition-all shadow-xl shadow-black/20"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Live Stream Telemetry</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Synthesizes streaming sensor readings across power substations, vehicle transit corridors, and landfill facilities with automated surge detection.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-[#0b1410] border border-[#16271e] hover:border-emerald-500/40 transition-all shadow-xl shadow-black/20"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Machine Learning Analytics</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Unsupervised Isolation Forest isolates abnormal emission bursts while regularized autoregression forecasts future municipal carbon trajectories.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="p-6 rounded-2xl bg-[#0b1410] border border-[#16271e] hover:border-emerald-500/40 transition-all shadow-xl shadow-black/20"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Policy Scenario Simulator</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Test municipal decarbonization interventions in real time: transit fleet electrification, rooftop solar expansion, and landfill methane diversion.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-16 px-8 max-w-7xl w-full mx-auto flex items-center justify-between border-t border-[#14231b]/80 text-xs text-slate-500 relative z-20">
        <div>CARBONIQ Platform • Certified IPCC GPC Framework</div>
        <div className="flex items-center gap-4">
          <Link href="/reports" className="hover:text-slate-300 transition-colors">Compliance Audits</Link>
          <Link href="/settings" className="hover:text-slate-300 transition-colors">Methodology</Link>
        </div>
      </footer>
    </div>
  );
}
