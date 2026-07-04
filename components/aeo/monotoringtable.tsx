import type { AeoMonitoringRow, MoteurIA } from "@/types/aeo";

const MOTEUR_STYLES: Record<MoteurIA, { bg: string; text: string; label: string }> = {
  perplexity: { bg: "#DCEBFB", text: "#1F5B93", label: "Perplexity" },
  chatgpt: { bg: "#E3F5EA", text: "#1F7A46", label: "ChatGPT" },
  gemini: { bg: "#F0E6FB", text: "#6A3FA0", label: "Gemini" },
  claude: { bg: "#FBE9DC", text: "#A6520F", label: "Claude" },
};

const STATUT_STYLES: Record<AeoMonitoringRow["statut"], { color: string; label: string }> = {
  cite: { color: "#2C9A4A", label: "Cité" },
  position: { color: "#D99A1E", label: "Position" },
  non_cite: { color: "#D5473B", label: "Non cité" },
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
      <p className="py-8 text-center text-sm text-[#8A8579]">
        Aucune requête suivie pour l'instant. Ajoutez-en une ci-dessus pour démarrer le monitoring.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#EDEAE2] text-left text-[#8A8579]">
          <th className="py-2 font-medium">Requête cible</th>
          <th className="py-2 font-medium">Moteur IA</th>
          <th className="py-2 font-medium">Domaine cité</th>
          <th className="py-2 font-medium">Statut</th>
          <th className="py-2 font-medium">Dernière vérif.</th>
          <th className="py-2 font-medium">Évolution</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const moteurStyle = MOTEUR_STYLES[row.moteur_ia];
          const statutStyle = STATUT_STYLES[row.statut];
          const isUp = row.evolution?.startsWith("+");
          const isDown = row.evolution === "Sorti" || row.evolution?.startsWith("-");

          return (
            <tr key={row.id} className="border-b border-[#F3F1EA] last:border-0">
              <td className="py-3 text-[#3D3A34]">{row.requete}</td>
              <td className="py-3">
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: moteurStyle.bg, color: moteurStyle.text }}
                >
                  {moteurStyle.label}
                </span>
              </td>
              <td className="py-3 text-[#3D3A34]">{row.domaine_cible}</td>
              <td className="py-3">
                <span className="inline-flex items-center gap-1.5" style={{ color: statutStyle.color }}>
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: statutStyle.color }}
                  />
                  {row.statut === "position" && row.position
                    ? `Position ${row.position}`
                    : statutStyle.label}
                </span>
              </td>
              <td className="py-3 text-[#8A8579]">{formatDate(row.derniere_verif)}</td>
              <td className="py-3">
                <span
                  className={
                    isUp
                      ? "text-[#2C9A4A]"
                      : isDown
                      ? "text-[#D5473B]"
                      : "text-[#8A8579]"
                  }
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