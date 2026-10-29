"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@carboniq.gov");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login({ email, password });
      localStorage.setItem("carboniq_token", res.access_token);
      localStorage.setItem("carboniq_user", JSON.stringify(res.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (role: "analyst" | "admin") => {
    if (role === "admin") {
      setEmail("admin@carboniq.gov");
      setPassword("Password123!");
    } else {
      setEmail("analyst@carboniq.gov");
      setPassword("Password123!");
    }
  };

  return (
    <div className="min-h-screen bg-[#060a08] text-slate-100 flex items-center justify-center p-6 selection:bg-emerald-500/30 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-md w-full rounded-3xl bg-[#0b1410] border border-[#16271e] p-8 shadow-2xl shadow-black relative overflow-hidden z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 flex items-center justify-center text-black font-bold mb-3 shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            CARBON<span className="text-emerald-400">IQ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Municipal Environmental Intelligence Platform
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/35 text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Officer Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#060a08] border border-[#1a2d23] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all"
                placeholder="name@carboniq.gov"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#060a08] border border-[#1a2d23] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            {isLoading ? "Authenticating..." : "Sign In to Platform"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>

        {/* Demo Fast-fill buttons */}
        <div className="mt-6 pt-6 border-t border-[#14231b] text-center">
          <p className="text-[10px] text-slate-500 mb-3 uppercase tracking-wider font-semibold">
            One-Click Demo Credentials
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("analyst")}
              className="flex-1 py-2 px-2.5 rounded-xl bg-[#0f1b15] hover:bg-[#15271d] border border-[#1a2d23] text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
            >
              Carbon Analyst
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin")}
              className="flex-1 py-2 px-2.5 rounded-xl bg-[#0f1b15] hover:bg-[#15271d] border border-[#1a2d23] text-xs font-semibold text-emerald-300 transition-colors cursor-pointer"
            >
              District Director
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
            ← Return to Public Overview
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
