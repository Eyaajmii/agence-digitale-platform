// components/kpis/anomaliesTable.tsx
"use client";

import { TrendingUp } from "lucide-react";
import { AnomalieRow } from "@/types/kpiss";

interface AnomaliesTableProps {
  data: AnomalieRow[];
}

const SPARKLINE_HEIGHTS = [4, 6, 5, 8, 7, 9, 10];

function StatutBadge({ statut }: { statut: AnomalieRow["statut"] }) {
  const styles =
    statut === "Critique"
      ? "bg-red-50 text-red-600"
      : statut === "Alerte"
      ? "bg-[#FF3D7F]/10 text-[#FF3D7F]"
      : "bg-emerald-50 text-emerald-700";

  const label =
    statut === "Critique"
      ? "Critique"
      : statut === "Alerte"
      ? "Alerte"
      : "Normal";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          statut === "Critique"
            ? "bg-red-500"
            : statut === "Alerte"
            ? "bg-[#FF3D7F]"
            : "bg-emerald-500"
        }`}
      />
      {label}
    </span>
  );
}

function Sparkline({ statut }: { statut: AnomalieRow["statut"] }) {
  const barColor =
    statut === "Critique"
      ? "bg-red-400"
      : statut === "Alerte"
      ? "bg-[#FF3D7F]"
      : "bg-[#6C4CFF]";

  return (
    <div className="flex h-6 items-end justify-center gap-0.5">
      {SPARKLINE_HEIGHTS.map((h, idx) => (
        <span
          key={idx}
          style={{ height: `${h * 2.3}px` }}
          className={`w-1 rounded-t-xs ${barColor}`}
        ></span>
      ))}
    </div>
  );
}

export default function AnomaliesTable({ data }: AnomaliesTableProps) {
  return (
    <div className="overflow-hidden overflow-x-auto rounded-2xl border border-[#1A1720]/10 bg-white">
      <div className="flex items-center gap-2 border-b border-[#1A1720]/10 px-6 py-4 text-sm font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
        <TrendingUp className="h-4 w-4 text-[#9C96B5]" />
        <span>Comparaison glissante — 7 derniers jours vs moyenne 30j</span>
      </div>

      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#1A1720]/10 text-[10px] uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
            <th className="px-6 py-3 font-medium">Métrique</th>
            <th className="px-6 py-3 font-medium">Moy. 7j</th>
            <th className="px-6 py-3 font-medium">Moy. 30j</th>
            <th className="px-6 py-3 font-medium">Variation</th>
            <th className="px-6 py-3 text-center font-medium">Tendance</th>
            <th className="px-6 py-3 text-right font-medium">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1A1720]/5">
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#9C96B5]">
                Aucune donnée d'anomalie disponible pour ce client.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
            <tr key={i} className="hover:bg-[#F4F5F1]/60">
              <td className="flex items-center gap-2 px-6 py-4 font-medium text-[#1A1720]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    row.statut === "Critique"
                      ? "bg-red-500"
                      : row.statut === "Alerte"
                      ? "bg-[#FF3D7F]"
                      : "bg-emerald-500"
                  }`}
                ></span>
                {row.name}
              </td>
              <td className="px-6 py-4 font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
                {row.moy7}
              </td>
              <td className="px-6 py-4 text-[#6B6579]">{row.moy30}</td>
              <td className="px-6 py-4">
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${
                    row.isNegative
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {row.variation}
                </span>
              </td>
              <td className="px-6 py-4">
                <Sparkline statut={row.statut} />
              </td>
              <td className="px-6 py-4 text-right">
                <StatutBadge statut={row.statut} />
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}