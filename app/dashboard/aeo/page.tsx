"use client";

import { useEffect, useState } from "react";
import { ScoreGauge, ScoreLabel } from "@/components/aeo/scoreGauge";
import { RecommendationCard } from "@/components/aeo/recommandationlist";
import { MonitoringTable } from "@/components/aeo/monotoringtable";
import type { AeoAudit, AeoMonitoringRow, MoteurIA } from "@/types/aeo";
import { useAeoClient } from "@/hooks/useAeoClient";

type Tab = "audit" | "generateur" | "monitoring";

export default function AeoPage() {
  const [tab, setTab] = useState<Tab>("audit");
  const { clients, selectedClient, loadingClients, handleClientChange } = useAeoClient();

  return (
    <div className="space-y-6 font-[Inter,sans-serif]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {!loadingClients && clients.length > 0 && (
            <select
              value={selectedClient}
              onChange={(e) => handleClientChange(e.target.value)}
              className="rounded-lg border border-[#1A1720]/10 bg-white px-3 py-2 text-sm font-medium text-[#1A1720] outline-none focus:border-[#6C4CFF]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          )}
        </div>

        <nav className="flex gap-1 rounded-full border border-[#1A1720]/10 bg-white p-1">
          {[
            { id: "audit" as Tab, label: "Audit & Score" },
            { id: "generateur" as Tab, label: "Générateur" },
            { id: "monitoring" as Tab, label: "Monitoring" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === item.id
                  ? "bg-gradient-to-r from-[#FF3D7F] to-[#6C4CFF] text-white"
                  : "text-[#6B6579] hover:text-[#1A1720]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {!selectedClient ? (
        <p className="text-sm text-[#9C96B5]">Chargement des clients…</p>
      ) : (
        <>
          {tab === "audit" && <AuditTab clientId={selectedClient} />}
          {tab === "generateur" && <GeneratorTab clientId={selectedClient} />}
          {tab === "monitoring" && <MonitoringTab clientId={selectedClient} />}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet 1 — Audit & Score
// ---------------------------------------------------------------------------
function AuditTab({ clientId }: { clientId: string }) {
  const [url, setUrl] = useState("https://maisonDoree.fr");
  const [audit, setAudit] = useState<AeoAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyse() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/aeo/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'analyse.");
      setAudit(data.audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  const sortedRecos = audit?.recommandations
    ? [...audit.recommandations].sort((a, b) => {
        const order = { eleve: 0, moyen: 1, faible: 2 };
        return order[a.impact] - order[b.impact];
      })
    : [];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
        <h2 className="mb-4 font-[Space_Grotesk,sans-serif] text-sm font-semibold text-[#1A1720]">
          Auditer une URL
        </h2>
        <div className="mb-5 flex gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-[#1A1720]/10 bg-[#F4F5F1] px-3 py-2 text-sm text-[#1A1720] outline-none focus:border-[#6C4CFF]"
          />
          <button
            onClick={handleAnalyse}
            disabled={loading || !url}
            className="rounded-lg bg-gradient-to-r from-[#FF3D7F] to-[#6C4CFF] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Analyse…" : "▷ Analyser"}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-[#FF3D7F]">{error}</p>}

        {audit ? (
          <div>
            <ScoreLabel score={audit.score_aeo} />
            <div className="mt-3">
              <ScoreGauge score={audit.score_aeo} details={audit.details_score} />
            </div>
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-[#9C96B5]">
              Renseignez une URL et lancez l'analyse pour obtenir le score AEO.
            </p>
          )
        )}
      </section>

      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
        <h2 className="mb-4 font-[Space_Grotesk,sans-serif] text-sm font-semibold text-[#1A1720]">
          Recommandations — par impact
        </h2>
        <div className="space-y-3">
          {sortedRecos.length > 0 ? (
            sortedRecos.map((reco, i) => <RecommendationCard key={i} recommandation={reco} />)
          ) : (
            <p className="text-sm text-[#9C96B5]">
              Les recommandations apparaîtront ici après l'analyse.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet 2 — Générateur AEO-ready
// ---------------------------------------------------------------------------
function GeneratorTab({ clientId }: { clientId: string }) {
  const [sujet, setSujet] = useState("");
  const [angle, setAngle] = useState("");
  const [publicCible, setPublicCible] = useState("");
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setArticle("");
    try {
      const res = await fetch("/api/aeo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, sujet, angle, publicCible }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Échec de la génération.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setArticle((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
        <h2 className="mb-4 font-[Space_Grotesk,sans-serif] text-sm font-semibold text-[#1A1720]">
          Brief de l'article
        </h2>
        <div className="space-y-3">
          <Field label="Sujet">
            <input
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Ex : le menu local et de saison"
              className="input"
            />
          </Field>
          <Field label="Angle éditorial">
            <input
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              placeholder="Ex : traçabilité et producteurs locaux"
              className="input"
            />
          </Field>
          <Field label="Public cible">
            <input
              value={publicCible}
              onChange={(e) => setPublicCible(e.target.value)}
              placeholder="Ex : familles à Tunis, sensibles au local"
              className="input"
            />
          </Field>
          <button
            onClick={handleGenerate}
            disabled={loading || !sujet || !publicCible}
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-[#FF3D7F] to-[#6C4CFF] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Génération…" : "Générer l'article"}
          </button>
          {error && <p className="text-sm text-[#FF3D7F]">{error}</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
        <h2 className="mb-4 font-[Space_Grotesk,sans-serif] text-sm font-semibold text-[#1A1720]">
          Article AEO-ready
        </h2>
        {article ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#1A1720]">
            {article}
          </pre>
        ) : (
          <p className="text-sm text-[#9C96B5]">
            L'article généré (définition, sections H2/H3, FAQ, données sourcées) s'affichera ici.
          </p>
        )}
      </section>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(26, 23, 32, 0.1);
          background: #f4f5f1;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #1a1720;
          outline: none;
        }
        .input:focus {
          border-color: #6c4cff;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-[IBM_Plex_Mono,monospace] text-[10px] font-medium uppercase tracking-[0.1em] text-[#9C96B5]">
        {label}
      </span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Onglet 3 — Monitoring des citations IA
// ---------------------------------------------------------------------------
function MonitoringTab({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<AeoMonitoringRow[]>([]);
  const [domaine, setDomaine] = useState("maisonDoree.fr");
  const [nouvelleRequete, setNouvelleRequete] = useState("");
  const [moteur, setMoteur] = useState<MoteurIA>("perplexity");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRows() {
    const res = await fetch(`/api/aeo/monitor?clientId=${clientId}`);
    const data = await res.json();
    if (res.ok) setRows(data.rows);
  }

  useEffect(() => {
    loadRows();
  }, [clientId]);

  async function handleVerifier() {
    if (!nouvelleRequete) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/aeo/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          domaineCible: domaine,
          requetes: [nouvelleRequete],
          moteurs: [moteur],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la vérification.");
      setNouvelleRequete("");
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
      <h2 className="mb-4 font-[Space_Grotesk,sans-serif] text-sm font-semibold text-[#1A1720]">
        Monitoring citations IA — domaines suivis
      </h2>

      <div className="mb-5 flex flex-wrap items-end gap-2">
        <div>
          <span className="mb-1 block font-[IBM_Plex_Mono,monospace] text-[10px] font-medium uppercase tracking-[0.1em] text-[#9C96B5]">
            Domaine cible
          </span>
          <input
            value={domaine}
            onChange={(e) => setDomaine(e.target.value)}
            className="rounded-lg border border-[#1A1720]/10 bg-[#F4F5F1] px-3 py-2 text-sm text-[#1A1720] outline-none focus:border-[#6C4CFF]"
          />
        </div>
        <div className="min-w-[220px] flex-1">
          <span className="mb-1 block font-[IBM_Plex_Mono,monospace] text-[10px] font-medium uppercase tracking-[0.1em] text-[#9C96B5]">
            Nouvelle requête à suivre
          </span>
          <input
            value={nouvelleRequete}
            onChange={(e) => setNouvelleRequete(e.target.value)}
            placeholder="Ex : meilleur restaurant local Tunis"
            className="w-full rounded-lg border border-[#1A1720]/10 bg-[#F4F5F1] px-3 py-2 text-sm text-[#1A1720] outline-none focus:border-[#6C4CFF]"
          />
        </div>
        <div>
          <span className="mb-1 block font-[IBM_Plex_Mono,monospace] text-[10px] font-medium uppercase tracking-[0.1em] text-[#9C96B5]">
            Moteur
          </span>
          <select
            value={moteur}
            onChange={(e) => setMoteur(e.target.value as MoteurIA)}
            className="rounded-lg border border-[#1A1720]/10 bg-[#F4F5F1] px-3 py-2 text-sm text-[#1A1720] outline-none focus:border-[#6C4CFF]"
          >
            <option value="perplexity">Perplexity</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
          </select>
        </div>
        <button
          onClick={handleVerifier}
          disabled={loading || !nouvelleRequete}
          className="rounded-lg bg-gradient-to-r from-[#FF3D7F] to-[#6C4CFF] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Vérification…" : "Vérifier maintenant"}
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-[#FF3D7F]">{error}</p>}

      <MonitoringTable rows={rows} />
    </section>
  );
}