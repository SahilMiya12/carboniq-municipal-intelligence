"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendPoint } from "@/types/api";

interface EmissionsTrendChartProps {
  data: TrendPoint[];
}

export function EmissionsTrendChart({ data }: EmissionsTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
        No trend data available for current period filter.
      </div>
    );
  }

  // Format date labels e.g. "10/04"
  const formattedData = data.map((d) => {
    const parts = d.date.split("-");
    const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : d.date;
    return { ...d, label };
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="elecGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="transGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="wasteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="indGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#14231b" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#14231b" }}
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#14231b" }}
            tickFormatter={(val) => `${val}t`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0a120e",
              borderColor: "#1e382b",
              borderRadius: "12px",
              boxShadow: "0 20px 30px -10px rgba(0,0,0,0.8)",
              color: "#f8fafc",
              fontSize: "12px",
              padding: "10px 14px",
            }}
            formatter={(value: any, name: any) => [`${value} tCO2e`, name]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
          />
          <Area
            type="monotone"
            dataKey="electricity_tco2e"
            name="Electricity Grid"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#elecGrad)"
            strokeWidth={2}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="transport_tco2e"
            name="Transit & Corridors"
            stroke="#38bdf8"
            fillOpacity={1}
            fill="url(#transGrad)"
            strokeWidth={2}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="waste_tco2e"
            name="Solid Waste"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#wasteGrad)"
            strokeWidth={2}
            animationDuration={1200}
          />
          <Area
            type="monotone"
            dataKey="industry_tco2e"
            name="Stationary Fuel"
            stroke="#c084fc"
            fillOpacity={1}
            fill="url(#indGrad)"
            strokeWidth={2}
            animationDuration={1400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
