// components/kpis/topBar.tsx
"use client";

import { RefreshCw, TrendingUp, FileDown } from "lucide-react";
import { ClientOption } from "@/types/kpiss";

interface TopBarProps {
  clients: ClientOption[];
  selectedClient: string;
  periode: string;
  loading: boolean;
  onClientChange: (id: string) => void;
  onPeriodeChange: (periode: string) => void;
  onGeneratePdf: () => void;
  onRefresh: () => void;
}

const PERIODES = ["7", "30", "90"];

export default function TopBar({
  clients,
  selectedClient,
  periode,
  loading,
  onClientChange,
  onPeriodeChange,
  onGeneratePdf,
  onRefresh,
}: TopBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1A1720]/10 bg-white px-6 py-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[#6C4CFF]" />
        <h2 className="text-sm font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
          KPIs publicitaires
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedClient}
          onChange={(e) => onClientChange(e.target.value)}
          className="rounded-lg border border-[#1A1720]/10 bg-white px-3 py-1.5 text-sm font-medium text-[#1A1720] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#6C4CFF]/40"
        >
          <option value="">Sélectionner un client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg border border-[#1A1720]/10 bg-white p-0.5">
          {PERIODES.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodeChange(p)}
              className={`rounded-md px-3 py-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] transition ${
                periode === p
                  ? "bg-[#F4F5F1] text-[#1A1720]"
                  : "text-[#9C96B5] hover:text-[#1A1720]"
              }`}
            >
              {p} j
            </button>
          ))}
        </div>

        <button
          onClick={onGeneratePdf}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FF3D7F] to-[#6C4CFF] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          <FileDown className="h-3.5 w-3.5" />
          {loading ? "Génération & Envoi..." : "Générer Rapport PDF"}
        </button>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-[#1A1720]/10 bg-white p-2 text-[#9C96B5] hover:bg-[#F4F5F1] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}