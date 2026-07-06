// components/kpis/ctrLineChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Percent } from "lucide-react";
import { MetaDailyRow } from "@/types/kpiss";

interface CtrLineChartProps {
  data: MetaDailyRow[];
}

export default function CtrLineChart({ data }: CtrLineChartProps) {
  return (
    <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-1.5 text-sm font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
        <Percent className="h-4 w-4 text-[#9C96B5]" /> CTR — Meta vs Google
      </h3>
      <div className="flex h-64 w-full justify-center">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[#9C96B5]">
            Pas de données CTR disponibles
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data}>
              <XAxis
                dataKey="date_start"
                stroke="#9C96B5"
                fontSize={11}
                tickLine={false}
              />
              <YAxis stroke="#9C96B5" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(26,23,32,0.1)",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  fontSize: 12,
                  paddingTop: 10,
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              />
              <Line
                type="monotone"
                dataKey="ctr"
                name="Meta"
                stroke="#6C4CFF"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="google_ctr"
                name="Google"
                stroke="#FF3D7F"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}