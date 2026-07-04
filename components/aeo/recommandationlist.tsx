import type { AeoRecommendation, ImpactLevel } from "@/types/aeo";

const IMPACT_STYLES: Record<ImpactLevel, { bg: string; text: string; label: string }> = {
  eleve: { bg: "#F6B8AE", text: "#7A2E1E", label: "Élevé" },
  moyen: { bg: "#F0CB6B", text: "#6B4D0A", label: "Moyen" },
  faible: { bg: "#B7E0B0", text: "#2C5B24", label: "Faible" },
};

export function RecommendationCard({ recommandation }: { recommandation: AeoRecommendation }) {
  const style = IMPACT_STYLES[recommandation.impact];

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ backgroundColor: style.bg }}
    >
      <span
        className="mb-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold"
        style={{ color: style.text }}
      >
        {style.label}
      </span>
      <p className="text-sm leading-snug" style={{ color: style.text }}>
        {recommandation.texte}
      </p>
    </div>
  );
}