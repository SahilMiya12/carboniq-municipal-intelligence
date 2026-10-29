"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Activity,
  MapPin,
  PieChart,
  Database,
  TrendingUp,
  Sliders,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/monitoring", label: "Live Telemetry", icon: Activity, badge: "LIVE" },
  { href: "/wards", label: "Municipal Wards", icon: MapPin },
  { href: "/sectors", label: "Sector Analytics", icon: PieChart },
  { href: "/data", label: "Data Import", icon: Database },
  { href: "/forecasting", label: "ML & Forecasting", icon: TrendingUp },
  { href: "/simulator", label: "Policy Simulator", icon: Sliders },
  { href: "/alerts", label: "Alerts Center", icon: Bell },
  { href: "/reports", label: "Audit Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ email: string; full_name: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("carboniq_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (_) {}
    } else {
      setUser({
        email: "analyst@carboniq.gov",
        full_name: "Marcus Chen",
        role: "Carbon Data Analyst",
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("carboniq_token");
    localStorage.removeItem("carboniq_user");
    router.push("/login");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen sticky top-0 bg-[#080d0a] border-r border-[#15231c] flex flex-col justify-between z-40 select-none shadow-2xl shrink-0"
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#14231b]">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-700 flex items-center justify-center text-black font-bold shadow-lg shadow-emerald-500/25 shrink-0">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="font-bold text-white tracking-wider text-base leading-none">
                    CARBON<span className="text-emerald-400">IQ</span>
                  </span>
                  <span className="text-[9px] text-emerald-400/80 uppercase font-semibold tracking-widest mt-1">
                    Municipal Intelligence
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-[#14231b] text-slate-400 hover:text-emerald-300 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Group */}
        <nav className="p-3 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {!collapsed ? "Modules" : "•"}
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group",
                  isActive
                    ? "text-emerald-200 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#101b15]"
                )}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavBackground"
                    className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/35 rounded-xl shadow-inner shadow-emerald-950"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 relative z-10 transition-colors",
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                {!collapsed && (
                  <span className="truncate flex-1 flex items-center justify-between relative z-10">
                    {item.label}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Status */}
      <div className="p-3 border-t border-[#14231b] bg-[#070b09]">
        {!collapsed && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-[#0d1612] border border-[#17271f] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-emerald-300 font-medium">District Grid Status</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              ONLINE
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#13221b] border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
              {user?.full_name ? user.full_name.charAt(0) : "C"}
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
                  {user?.full_name?.split(" ")[0] || "Analyst"}
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline shrink-0" />
                </div>
                <div className="text-[10px] text-slate-500 truncate">{user?.role || "Municipal Staff"}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
