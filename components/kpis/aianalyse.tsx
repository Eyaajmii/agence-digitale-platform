// components/kpis/aiAnalysisPanel.tsx
"use client";

import { Sparkles, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { AiAnalysis } from "@/types/kpiss";

interface AiAnalysisPanelProps {
  loadingAi: boolean;
  aiAnalysis: AiAnalysis | null;
}

export default function AiAnalysisPanel({
  loadingAi,
  aiAnalysis,
}: AiAnalysisPanelProps) {
  if (loadingAi) {
    return (
      <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-[#6C4CFF]/20 bg-white p-5 text-sm font-medium text-[#6C4CFF]">
        <Sparkles className="h-4 w-4 animate-spin text-[#6C4CFF]" />
        <span>Claude IA génère l'audit stratégique en arrière-plan...</span>
      </div>
    );
  }

  if (!aiAnalysis) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-[#1A1720]/10 bg-white p-6">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#6C4CFF]" />
        <h3 className="text-sm font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
          Analyse IA — Claude
        </h3>
        <span className="rounded-full bg-[#F4F5F1] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
          30 derniers jours
        </span>
      </div>

      <div className="space-y-3">
        {aiAnalysis.campagnes_a_risque?.map((cr, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl border border-[#FF3D7F]/20 bg-[#FF3D7F]/5 p-3.5 text-sm text-[#1A1720]"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3D7F]" />
            <p className="font-medium">
              <strong className="font-[Space_Grotesk,sans-serif] font-bold">
                {cr.nom}:{" "}
              </strong>
              {cr.raison} —{" "}
              <span className="rounded-sm bg-[#FF3D7F]/10 px-1.5 py-0.5 text-xs font-medium font-[IBM_Plex_Mono,monospace] text-[#FF3D7F]">
                Métrique: {cr.metrique_critique}
              </span>
            </p>
          </div>
        ))}

        {aiAnalysis.recommandations?.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-[#1A1720]"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="font-medium">
              <strong className="font-[Space_Grotesk,sans-serif] font-bold">
                Recommandation:{" "}
              </strong>
              {rec.action} —{" "}
              <span className="text-xs font-normal text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
                Impact attendu: {rec.impact_attendu} (Priorité {rec.priorite})
              </span>
            </p>
          </div>
        ))}

        {aiAnalysis.anomalies?.map((an, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-[#1A1720]"
          >
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p className="font-medium">
              <span className="mr-1.5 inline-block rounded-xs bg-red-600 px-1.5 py-0.5 text-[10px] font-bold font-[IBM_Plex_Mono,monospace] text-white">
                {an.importance}
              </span>
              <strong className="font-[Space_Grotesk,sans-serif] font-bold">
                Anomalie:{" "}
              </strong>
              {an.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}