"use client";

import type { AeoDetailsScore } from "@/types/aeo";

const CRITERIA_LABELS: { key: keyof AeoDetailsScore; label: string; color: string }[] = [
  { key: "clarte_definitions", label: "Clarté des définitions", color: "#7B6EF6" },
  { key: "donnees_chiffrees", label: "Données chiffrées", color: "#E8A845" },
  { key: "structure_faq", label: "Structure FAQ", color: "#E06B6B" },
  { key: "entites_nommees", label: "Entités nommées", color: "#4CAF7D" },
  { key: "autorite_sources", label: "Autorité des sources", color: "#7B6EF6" },
];

export function ScoreGauge({
  score,
  details,
}: {
  score: number;
  details: AeoDetailsScore;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="flex items-start gap-6">
      <div className="relative h-[110px] w-[110px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#EDEAE2"
            strokeWidth="9"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#7B6EF6"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-[#3D3A34]">
          {Math.round(progress)}
        </div>
      </div>

      <div className="flex-1 space-y-2.5 pt-1">
        {CRITERIA_LABELS.map(({ key, label, color }) => (
          <div key={key} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-40 shrink-0 text-[#5B574E]">{label}</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#EDEAE2]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${details[key]}%`, backgroundColor: color }}
                />
              </div>
            </div>
            <span className="text-right font-medium text-[#3D3A34]">{details[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoreLabel({ score }: { score: number }) {
  return (
    <p className="text-sm text-[#5B574E]">
      Score AEO —{" "}
      <span className="font-semibold text-[#3D3A34]">{Math.round(score)}/100</span>
    </p>
  );
}