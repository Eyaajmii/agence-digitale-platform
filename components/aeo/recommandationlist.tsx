import type { AeoRecommendation, ImpactLevel } from "@/types/aeo";

const IMPACT_STYLES: Record<ImpactLevel,{ bar: string; badgeBg: string; badgeText: string; label: string }> = {
  eleve: { bar: "bg-[#FF3D7F]", badgeBg: "bg-[#FF3D7F]/10", badgeText: "text-[#FF3D7F]", label: "Élevé" },
  moyen: { bar: "bg-amber-400", badgeBg: "bg-amber-50", badgeText: "text-amber-700", label: "Moyen" },
  faible: { bar: "bg-emerald-500", badgeBg: "bg-emerald-50", badgeText: "text-emerald-700", label: "Faible" },
};

export function RecommendationCard({
  recommandation,
}: {
  recommandation: AeoRecommendation;
}) {
  const style = IMPACT_STYLES[recommandation.impact];

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1A1720]/10 bg-white py-3 pl-5 pr-4">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${style.bar}`} />
      <span
        className={`mb-1.5 inline-block rounded-full px-2.5 py-0.5 font-[IBM_Plex_Mono,monospace] text-[10px] font-semibold uppercase tracking-[0.1em] ${style.badgeBg} ${style.badgeText}`}
      >
        {style.label}
      </span>
      <p className="text-sm leading-snug text-[#1A1720]">{recommandation.texte}</p>
    </div>
  );
}