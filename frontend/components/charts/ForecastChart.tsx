"use client";

import React from "react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  Line,
  ComposedChart,
} from "recharts";
import { ForecastPoint } from "@/types/api";

interface ForecastChartProps {
  historical: ForecastPoint[];
  projected: ForecastPoint[];
}

export function ForecastChart({ historical, projected }: ForecastChartProps) {
  const combined = [
    ...historical.map((h) => ({
      date: h.date.slice(5), // MM-DD
      observed: h.forecast_tco2e,
      forecast: null,
      lower: null,
      upper: null,
    })),
    ...projected.map((p) => ({
      date: p.date.slice(5),
      observed: null,
      forecast: p.forecast_tco2e,
      lower: p.lower_bound_tco2e,
      upper: p.upper_bound_tco2e,
    })),
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combined} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#14231b" vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
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
            }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
          <Line
            type="monotone"
            dataKey="observed"
            name="Audited Observations"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="ML Projected Emissions"
            stroke="#38bdf8"
            strokeWidth={2.5}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: "#38bdf8", stroke: "#060a08", strokeWidth: 1.5 }}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="upper"
            name="95% Confidence Band"
            stroke="transparent"
            fill="url(#forecastBand)"
            animationDuration={1200}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
