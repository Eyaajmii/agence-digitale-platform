// components/kpis/spendBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { MetaDailyRow } from "@/types/kpiss";

interface SpendBarChartProps {
  data: MetaDailyRow[];
}

export default function SpendBarChart({ data }: SpendBarChartProps) {
  return (
    <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-1.5 text-sm font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
        <TrendingUp className="h-4 w-4 text-[#9C96B5]" /> Dépenses quotidiennes
        (€)
      </h3>
      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[#9C96B5]">
            Pas de données de dépenses disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="date_start"
                stroke="#9C96B5"
                fontSize={11}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(26,23,32,0.1)",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="spend"
                fill="#6C4CFF"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}