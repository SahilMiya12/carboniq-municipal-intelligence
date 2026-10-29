"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { SectorBreakdown } from "@/types/api";

interface SectorBreakdownChartProps {
  data: SectorBreakdown[];
}

const COLORS = ["#10b981", "#38bdf8", "#f59e0b", "#c084fc", "#f43f5e"];

export function SectorBreakdownChart({ data }: SectorBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-slate-500 text-xs">
        No sectoral data available.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.sector_name,
    value: item.emissions_tco2e,
    percentage: item.percentage,
  }));

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="46%"
            innerRadius={68}
            outerRadius={98}
            paddingAngle={4}
            dataKey="value"
            animationDuration={900}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#080f0c"
                strokeWidth={2.5}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0a120e",
              borderColor: "#1e382b",
              borderRadius: "10px",
              color: "#f8fafc",
              fontSize: "12px",
              boxShadow: "0 15px 30px rgba(0,0,0,0.8)",
            }}
            formatter={(val: any, name: any) => [`${val} tCO2e`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Donut Stat */}
      <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
          Audited
        </span>
        <span className="text-xl font-extrabold font-mono text-white">
          {total > 999 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
        </span>
        <span className="text-[10px] text-emerald-400 block font-semibold">tCO2e</span>
      </div>
    </div>
  );
}
