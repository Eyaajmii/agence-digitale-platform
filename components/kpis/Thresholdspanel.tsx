// components/kpis/thresholdsPanel.tsx
"use client";

import { RefreshCw } from "lucide-react";
import { Seuils } from "@/types/kpiss";

interface ThresholdsPanelProps {
  seuils: Seuils;
  onChange: (seuils: Seuils) => void;
}

interface ThresholdFieldConfig {
  key: keyof Seuils;
  label: string;
  unit: string;
  step?: string;
  alerteActive: boolean;
  critiqueActive: boolean;
}

const FIELDS: ThresholdFieldConfig[] = [
  {
    key: "roasMin",
    label: "ROAS — seuil bas",
    unit: "x",
    step: "0.1",
    alerteActive: true,
    critiqueActive: true,
  },
  {
    key: "ctrMin",
    label: "CTR — seuil bas",
    unit: "%",
    step: "0.1",
    alerteActive: true,
    critiqueActive: false,
  },
  {
    key: "cpmMax",
    label: "CPM — seuil haut",
    unit: "€",
    alerteActive: false,
    critiqueActive: true,
  },
  {
    key: "varMax",
    label: "Variation max / 7j",
    unit: "%",
    alerteActive: true,
    critiqueActive: false,
  },
];

function Badge({ active, critique }: { active: boolean; critique?: boolean }) {
  if (!active) {
    return (
      <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium font-[IBM_Plex_Mono,monospace] uppercase tracking-wider text-[#9C96B5] border border-[#1A1720]/10">
        {critique ? "Critique" : "Alerte"}
      </span>
    );
  }
  return critique ? (
    <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-medium font-[IBM_Plex_Mono,monospace] uppercase tracking-wider text-red-600">
      Critique
    </span>
  ) : (
    <span className="rounded-full bg-[#FF3D7F]/10 px-2.5 py-0.5 text-[10px] font-medium font-[IBM_Plex_Mono,monospace] uppercase tracking-wider text-[#FF3D7F]">
      Alerte
    </span>
  );
}

export default function ThresholdsPanel({
  seuils,
  onChange,
}: ThresholdsPanelProps) {
  const handleFieldChange = (key: keyof Seuils, rawValue: string) => {
    const value =
      key === "roasMin" || key === "ctrMin"
        ? parseFloat(rawValue)
        : parseInt(rawValue, 10);
    onChange({ ...seuils, [key]: value });
  };

  return (
    <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
        <RefreshCw className="h-4 w-4 text-[#6C4CFF]" />
        <span>Seuils d'alerte configurables</span>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#1A1720]/10 bg-[#1A1720]/10 sm:grid-cols-2 lg:grid-cols-4">
        {FIELDS.map((field) => (
          <div key={field.key} className="bg-white p-4">
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
              {field.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={field.step}
                value={seuils[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full border-b border-[#1A1720]/15 pb-1 text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] focus:outline-none focus:border-[#6C4CFF]"
              />
              <span className="text-sm font-medium text-[#9C96B5]">
                {field.unit}
              </span>
            </div>
            <div className="mt-3 flex gap-1.5">
              <Badge active={field.alerteActive} />
              <Badge active={field.critiqueActive} critique />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}