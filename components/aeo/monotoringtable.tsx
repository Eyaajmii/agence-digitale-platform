import type { AeoMonitoringRow, MoteurIA } from "@/types/aeo";

const MOTEUR_STYLES: Record<MoteurIA, { bg: string; text: string; label: string }> = {
  perplexity: { bg: "bg-[#DCEBFB]", text: "text-[#1F5B93]", label: "Perplexity" },
  chatgpt: { bg: "bg-emerald-50", text: "text-emerald-700", label: "ChatGPT" },
  gemini: { bg: "bg-[#6C4CFF]/10", text: "text-[#6C4CFF]", label: "Gemini" },
  claude: { bg: "bg-[#FF3D7F]/10", text: "text-[#FF3D7F]", label: "Claude" },
};

const STATUT_STYLES: Record<AeoMonitoringRow["statut"], { dot: string; text: string; label: string }> = {
  cite: { dot: "bg-emerald-500", text: "text-emerald-700", label: "Cité" },
  position: { dot: "bg-amber-400", text: "text-amber-700", label: "Position" },
  non_cite: { dot: "bg-[#FF3D7F]", text: "text-[#FF3D7F]", label: "Non cité" },
};

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / 36e5;
  if (diffHours < 20) return "Aujourd'hui";
  if (diffHours < 44) return "Hier";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function MonitoringTable({ rows }: { rows: AeoMonitoringRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#9C96B5]">
        Aucune requête suivie pour l'instant. Ajoutez-en une ci-dessus pour démarrer le monitoring.
      </p>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-[#1A1720]/10 font-[IBM_Plex_Mono,monospace] text-[10px] uppercase tracking-[0.15em] text-[#9C96B5]">
          <th className="py-3 font-medium">Requête cible</th>
          <th className="py-3 font-medium">Moteur IA</th>
          <th className="py-3 font-medium">Domaine cité</th>
          <th className="py-3 font-medium">Statut</th>
          <th className="py-3 font-medium">Dernière vérif.</th>
          <th className="py-3 font-medium">Évolution</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#1A1720]/5">
        {rows.map((row) => {
          const moteurStyle = MOTEUR_STYLES[row.moteur_ia];
          const statutStyle = STATUT_STYLES[row.statut];
          const isUp = row.evolution?.startsWith("+");
          const isDown = row.evolution === "Sorti" || row.evolution?.startsWith("-");

          return (
            <tr key={row.id} className="hover:bg-[#F4F5F1]/60">
              <td className="py-3.5 font-medium text-[#1A1720]">{row.requete}</td>
              <td className="py-3.5">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-[IBM_Plex_Mono,monospace] text-[10px] font-semibold uppercase tracking-[0.05em] ${moteurStyle.bg} ${moteurStyle.text}`}
                >
                  {moteurStyle.label}
                </span>
              </td>
              <td className="py-3.5 text-[#6B6579]">{row.domaine_cible}</td>
              <td className="py-3.5">
                <span className={`inline-flex items-center gap-1.5 font-medium ${statutStyle.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statutStyle.dot}`} />
                  {row.statut === "position" && row.position
                    ? `Position ${row.position}`
                    : statutStyle.label}
                </span>
              </td>
              <td className="py-3.5 font-[IBM_Plex_Mono,monospace] text-xs text-[#9C96B5]">
                {formatDate(row.derniere_verif)}
              </td>
              <td className="py-3.5">
                <span
                  className={`font-[IBM_Plex_Mono,monospace] text-xs font-medium ${
                    isUp ? "text-emerald-600" : isDown ? "text-[#FF3D7F]" : "text-[#9C96B5]"
                  }`}
                >
                  {isUp && "↑ "}
                  {isDown && row.evolution !== "Sorti" && "↓ "}
                  {row.evolution ?? "—"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}