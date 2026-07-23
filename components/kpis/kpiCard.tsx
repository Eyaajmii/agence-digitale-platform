"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

import type { TrendDirection } from "@/types/kpiss";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trendValue: string;
  trendDirection: TrendDirection;
}

export default function KpiCard({
  icon: Icon,
  label,
  value,
  trendValue,
  trendDirection,
}: KpiCardProps) {
  const TrendIcon =
    trendDirection === "up"
      ? ArrowUpRight
      : trendDirection === "down"
      ? ArrowDownRight
      : Minus;

  const trendColor =
    trendDirection === "up"
      ? "text-emerald-600"
      : trendDirection === "down"
      ? "text-red-500"
      : "text-[#9C96B5]";

  return (
    <div className="relative bg-white p-6">
      <span className="absolute left-0 top-0 h-full w-[3px] bg-blue-300" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#6B6579]">{label}</span>
        <Icon className="h-4 w-4 text-[#9C96B5]" />
      </div>
      <p className="mt-3 text-3xl font-[Space_Grotesk,sans-serif] font-bold tabular-nums text-[#1A1720]">
        {value}
      </p>
      <p
        className={`mt-2 flex items-center gap-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${trendColor}`}
      >
        <TrendIcon className="h-3.5 w-3.5" />
        {trendValue}
      </p>
    </div>
  );
}