//Formulaire brief
"use client";

import { useState, useEffect } from "react";
import { useGenerate } from "@/hooks/usegenerate";
import { createBrowserClient } from "@supabase/ssr";
import { addCalendrierEvent } from "@/lib/supabase/calendrier";

const PLATFORMS = [
  { value: "Twitter", label: "𝕏 Twitter", maxChars: 280 },
  { value: "Instagram", label: "📸 Instagram", maxChars: 2200 },
  { value: "Facebook", label: "📘 Facebook", maxChars: 500 },
  { value: "Linkedin", label: "💼 LinkedIn", maxChars: 3000 },
  { value: "GoogleAds", label: "🔍 Google Ads", maxChars: 90 },
  { value: "TikTok", label: "TikTok", maxChars: 4000 },
];

interface Client {
  id: string;
  nom: string;
  secteur: string;
}

export default function GeneratePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [objective, setObjective] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [contenuIds, setContenuIds] = useState<Record<number, string>>({});
  const [planningIndex, setPlanningIndex] = useState<number | null>(null);
  const [planningDate, setPlanningDate] = useState("");
  const [planning, setPlanning] = useState(false);
  const {
    generate,
    cancel,
    streamedText,
    variants,
    contentId,
    isStreaming,
    error,
  } = useGenerate();

  // Load clients on mount
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("clients")
      .select("id, nom, secteur")
      .order("nom")
      .then(({ data }) => {
        if (data) setClients(data);
      });
  }, []);

  const handleSubmit = () => {
    if (!clientId || !platform || !objective.trim()) return;
    setContenuIds({});
    generate({ clientId, platform, objective });
  };
  const saveContenu = async (text: string, index: number): Promise<string> => {
    if (contenuIds[index]) return contenuIds[index]; 
  
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  
    const { data, error } = await supabase
      .from("contenus")
      .insert({
        client_id: clientId,
        plateforme: platform,
        statut: "Apprové",
        texte: text,
        variantes: variants,
        objective: objective,
      })
      .select("id")
      .single();
  
    if (error) throw error;
  
    setContenuIds((prev) => ({ ...prev, [index]: data.id }));
    return data.id;
  };
  const handleValidate = async (text: string, index: number) => {
    try {
      await saveContenu(text, index);
      alert(`✅ Variante ${index + 1} enregistrée !`);
    } catch (err) {
      console.error(err);
    }
  };
  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectedPlatform = PLATFORMS.find((p) => p.value === platform);
  const canSubmit = clientId && platform && objective.trim() && !isStreaming;

  const openPlanifier = (index: number) => {
    setPlanningIndex(index);
    setPlanningDate(new Date().toISOString().slice(0, 10)); // aujourd'hui par défaut
  };

  const handleConfirmPlanifier = async () => {
    if (planningIndex === null || !planningDate) return;
    setPlanning(true);
    try {
      const id = await saveContenu(variants[planningIndex], planningIndex);
      await addCalendrierEvent(id, clientId, planningDate);
      setPlanningIndex(null);
      alert(
        `📅 Variante ${planningIndex + 1} planifiée pour le ${planningDate}`
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la planification");
    } finally {
      setPlanning(false);
    }
  };
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          ✨ Générateur de Contenu IA
        </h1>
        <p className="text-gray-500 mt-1">
          Génère 3 variantes de copy publicitaire avec Claude en quelques
          secondes.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client *
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-700"
          >
            <option value="">— Sélectionner un client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom} · {c.secteur}
              </option>
            ))}
          </select>
        </div>

        {/* Platform selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plateforme *
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  platform === p.value
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-violet-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {selectedPlatform && (
            <p className="text-xs text-gray-400 mt-1">
              Max {selectedPlatform.maxChars} caractères
            </p>
          )}
        </div>

        {/* Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objectif de la campagne *
          </label>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Ex: Promouvoir le lancement de notre nouvelle collection printemps-été, cibler les femmes 25-40 ans, générer des clics vers la boutique en ligne..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none text-gray-700"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? "Génération en cours..." : "🚀 Générer 3 variantes"}
          </button>
          {isStreaming && (
            <button
              onClick={cancel}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Streaming preview (live text while generating) */}
      {isStreaming && streamedText && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-600">
              Génération en cours…
            </span>
          </div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {streamedText}
          </pre>
        </div>
      )}

      {/* Variants (displayed after completion) */}
      {!isStreaming && variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              ✅ {variants.length} variantes générées
            </h2>
            {/*{contentId && (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Sauvegardé · ID {contentId.slice(0, 8)}…
              </span>
            )}*/}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {variants.map((variant, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4 hover:border-violet-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                    Variante {i + 1}
                  </span>
                  <span className="text-xs text-gray-400">
                    {variant.length} car.
                  </span>
                </div>

                <p className="text-sm text-gray-800 leading-relaxed flex-1 whitespace-pre-wrap">
                  {variant}
                </p>

                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => handleCopy(variant, i)}
                    className="flex-1 text-xs py-2 rounded-lg bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-700 transition-colors font-medium"
                  >
                    {copiedIndex === i ? "✓ Copié !" : "📋 Copier"}
                  </button>
                  <button
                    onClick={() => handleValidate(variant, i)}
                    //disabled={!contentId}
                    className="flex-1 text-xs py-2 rounded-lg bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-colors font-medium"
                  >
                    ✅ Valider
                  </button>
                  <button
                    onClick={() => openPlanifier(i)}
                    className="flex-1 text-xs py-2 rounded-lg bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    📅 Planifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {planningIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900">
              Planifier la variante {planningIndex + 1}
            </h2>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Date de publication
              </label>
              <input
                type="date"
                value={planningDate}
                onChange={(e) => setPlanningDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmPlanifier}
                disabled={!planningDate || planning}
                className="flex-1 bg-violet-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-40 transition-colors"
              >
                {planning ? "Planification…" : "Confirmer"}
              </button>
              <button
                onClick={() => setPlanningIndex(null)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
