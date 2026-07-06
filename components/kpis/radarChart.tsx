"use client";

import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Activity } from "lucide-react";
import { Seuils, AnomalieRow } from "@/types/kpiss";

interface RadarChartProps {
  roas: number | null;
  ctr: number | null;
  seuils: Seuils;
  anomalies: AnomalieRow[];
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

// Score ROAS : 100% atteint à 2x le seuil minimum configuré
function scoreRoas(roas: number | null, seuilMin: number): number | null {
  if (roas === null || seuilMin <= 0) return null;
  return clamp((roas / (seuilMin * 2)) * 100);
}

// Score CTR : 100% atteint à 2x le seuil minimum configuré
function scoreCtr(ctr: number | null, seuilMin: number): number | null {
  if (ctr === null || seuilMin <= 0) return null;
  return clamp((ctr / (seuilMin * 2)) * 100);
}

// Score Stabilité : proportion de métriques "Normal" dans le tableau d'anomalies
function scoreStabilite(anomalies: AnomalieRow[]): number | null {
  if (anomalies.length === 0) return null;
  const normalCount = anomalies.filter((a) => a.statut === "Normal").length;
  return clamp((normalCount / anomalies.length) * 100);
}

export default function RadarChart({
  roas,
  ctr,
  seuils,
  anomalies,
}: RadarChartProps) {
  const roasScore = scoreRoas(roas, seuils.roasMin);
  const ctrScore = scoreCtr(ctr, seuils.ctrMin);
  const stabiliteScore = scoreStabilite(anomalies);

  const axes = [
    { metric: "ROAS", valeur: roasScore },
    { metric: "CTR", valeur: ctrScore },
    { metric: "Stabilité", valeur: stabiliteScore },
  ];

  const scoresDisponibles = axes
    .map((a) => a.valeur)
    .filter((v): v is number => v !== null);

  const hasData = scoresDisponibles.length > 0;
  const scoreGlobal = hasData
    ? Math.round(
        scoresDisponibles.reduce((acc, v) => acc + v, 0) /
          scoresDisponibles.length
      )
    : null;

  const chartData = axes.map((a) => ({ ...a, valeur: a.valeur ?? 0 }));

  return (
    <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
          <Activity className="h-4 w-4 text-[#9C96B5]" /> Santé globale
        </h3>
        {scoreGlobal !== null && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${
              scoreGlobal >= 70
                ? "bg-emerald-50 text-emerald-700"
                : scoreGlobal >= 40
                ? "bg-[#FF3D7F]/10 text-[#FF3D7F]"
                : "bg-red-50 text-red-600"
            }`}
          >
            {scoreGlobal}%
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-64 items-center justify-center text-sm text-[#9C96B5]">
          Pas encore de données pour calculer la santé globale
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ReRadarChart data={chartData} outerRadius="70%">
              <PolarGrid stroke="rgba(26,23,32,0.1)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: "#6B6579",
                  fontSize: 11,
                  fontFamily: "IBM Plex Mono, monospace",
                }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                dataKey="valeur"
                stroke="#6C4CFF"
                fill="#6C4CFF"
                fillOpacity={0.3}
              />
              <Tooltip
                formatter={(value) => {
                  const num = Number(value ?? 0);
                  return `${Math.round(num)}%`;
                }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(26,23,32,0.1)",
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: 12,
                }}
              />
            </ReRadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="mt-3 text-xs text-[#9C96B5]">
        100% = ROAS ou CTR à 2x le seuil configuré · Stabilité = % de métriques
        sans alerte sur 7j vs 30j.
      </p>
    </div>
  );
}
