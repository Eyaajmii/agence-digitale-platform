"use client";

import type { AeoDetailsScore } from "@/types/aeo";

const CRITERIA_LABELS: { key: keyof AeoDetailsScore; label: string }[] = [
  { key: "clarte_definitions", label: "Clarté des définitions" },
  { key: "donnees_chiffrees", label: "Données chiffrées" },
  { key: "structure_faq", label: "Structure FAQ" },
  { key: "entites_nommees", label: "Entités nommées" },
  { key: "autorite_sources", label: "Autorité des sources" },
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
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3D7F" />
              <stop offset="100%" stopColor="#6C4CFF" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#1A1720"
            strokeOpacity="0.08"
            strokeWidth="9"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-[Space_Grotesk,sans-serif] text-3xl font-bold tabular-nums text-[#1A1720]">
          {Math.round(progress)}
        </div>
      </div>

      <div className="flex-1 space-y-3 pt-1">
        {CRITERIA_LABELS.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-40 shrink-0 text-xs text-[#6B6579]">{label}</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#1A1720]/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF3D7F] to-[#6C4CFF]"
                  style={{ width: `${details[key]}%` }}
                />
              </div>
            </div>
            <span className="text-right font-[IBM_Plex_Mono,monospace] text-xs font-medium tabular-nums text-[#1A1720]">
              {details[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoreLabel({ score }: { score: number }) {
  return (
    <p className="text-sm text-[#6B6579]">
      Score AEO —{" "}
      <span className="font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720]">
        {Math.round(score)}/100
      </span>
    </p>
  );
}