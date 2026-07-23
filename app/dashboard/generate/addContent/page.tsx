"use client";

import { useState, useEffect } from "react";
import { useGenerate } from "@/hooks/usegenerate";
import { createBrowserClient } from "@supabase/ssr";
import { addCalendrierEvent } from "@/lib/supabase/calendrier";
import Link from "next/link";

import {
  Sparkles,
  Search,
  Music2,
  Copy,
  Check,
  CalendarPlus,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaTiktok,
} from "react-icons/fa";
const PLATFORMS = [
  { value: "Twitter", label: "Twitter / X", icon: FaTwitter, maxChars: 280 },
  { value: "Instagram", label: "Instagram", icon: FaInstagram, maxChars: 2200 },
  { value: "Facebook", label: "Facebook", icon: FaFacebook, maxChars: 500 },
  { value: "Linkedin", label: "LinkedIn", icon: FaLinkedin, maxChars: 3000 },
  { value: "GoogleAds", label: "Google Ads", icon: Search, maxChars: 90 },
  { value: "TikTok", label: "TikTok", icon: FaTiktok, maxChars: 4000 },
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
        statut: "Approuvé",
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
      alert(`Variante ${index + 1} enregistrée !`);
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
    setPlanningDate(new Date().toISOString().slice(0, 10));
  };

  const handleConfirmPlanifier = async () => {
    if (planningIndex === null || !planningDate) return;
    setPlanning(true);
    try {
      const id = await saveContenu(variants[planningIndex], planningIndex);
      await addCalendrierEvent(id, clientId, planningDate);
      setPlanningIndex(null);
      alert(`Variante ${planningIndex + 1} planifiée pour le ${planningDate}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la planification");
    } finally {
      setPlanning(false);
    }
  };
  const inputClass = `
w-full
rounded-xl
border
border-slate-200
bg-white
px-4
py-3
text-sm
text-slate-900
outline-none
focus:border-blue-500
focus:ring-4
focus:ring-blue-100
transition-all
`;
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-[Inter,sans-serif]">
      {/* En-tête */}
      <div className="mb-6">
        <Link
          href="/dashboard/generate"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Retour
        </Link>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Générateur de contenu IA
        </h1>

        <p className="mt-1 text-slate-500">
        Crée automatiquement plusieurs variantes de contenu marketing.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-[#FF3D7F]/30 bg-[#FF3D7F]/10 px-4 py-3 text-sm text-[#c72c68]">
          {error}
        </div>
      )}
      {/* Formulaire brief */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1A1720] mb-1.5">
            Client <span className="text-[#FF3D7F]">*</span>
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputClass}
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
          <label className="block text-sm font-medium text-[#1A1720] mb-2">
            Plateforme <span className="text-[#FF3D7F]">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const active = platform === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setPlatform(p.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    active
                      ? "bg-blue-600 text-white hover:border-blue-300"
                      : "bg-white text-[#6B6579] border-[#1A1720]/10 hover:border-[#6C4CFF]/40 hover:text-[#1A1720]"
                  }`}
                >
                  <Icon size={15} strokeWidth={active ? 2.3 : 2} />
                  {p.label}
                </button>
              );
            })}
          </div>
          {selectedPlatform && (
            <p className="text-xs text-[#9C96B5] mt-2 font-[IBM_Plex_Mono,monospace]">
              Max {selectedPlatform.maxChars} caractères
            </p>
          )}
        </div>

        {/* Objective */}
        <div>
          <label className="block text-sm font-medium text-[#1A1720] mb-1.5">
            Objectif de la campagne <span className="text-[#FF3D7F]">*</span>
          </label>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Ex: Promouvoir le lancement de notre nouvelle collection printemps-été, cibler les femmes 25-40 ans, générer des clics vers la boutique en ligne..."
            rows={3}
            className={inputClass}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Génération en cours…
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Générer 3 variantes
              </>
            )}
          </button>
          {isStreaming && (
            <button
              onClick={cancel}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F4F5F1] text-[#6B6579] text-sm font-medium rounded-lg hover:bg-[#1A1720]/10 transition-colors"
            >
              <X size={15} />
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Streaming preview */}
      {isStreaming && streamedText && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3D7F]" />
            </span>
            <span className="text-sm font-medium text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
              Génération en cours…
            </span>
          </div>
          <pre className="text-sm text-[#1A1720] whitespace-pre-wrap font-sans leading-relaxed">
            {streamedText}
          </pre>
        </div>
      )}

      {/* Variants */}
      {!isStreaming && variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720] flex items-center gap-2">
              <Check size={18} className="text-emerald-600" />
              {variants.length} variantes générées
            </h2>
          </div>

          <div className="grid gap-5 xl:grid-cols-3 md:grid-cols-2">
            {variants.map((variant, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-700 bg-blue-70 px-2.5 py-1 rounded-full font-[IBM_Plex_Mono,monospace]">
                    Variante {i + 1}
                  </span>
                  <span className="text-xs text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
                    {variant.length} car.
                  </span>
                </div>

                <p className="text-sm text-[#1A1720] leading-relaxed flex-1 whitespace-pre-wrap">
                  {variant}
                </p>

                <div className="flex gap-2 pt-3 border-t border-[#1A1720]/10">
                  <button
                    onClick={() => handleCopy(variant, i)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-blue-50 hover:bg-blue-50 text-[#6B6579] hover:text-blue-700 transition-colors font-medium"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check size={13} />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copier
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleValidate(variant, i)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-700 transition-colors font-medium"
                  >
                    <Check size={13} />
                    Valider
                  </button>
                  <button
                    onClick={() => openPlanifier(i)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-[#FF3D7F] transition-colors font-medium"
                  >
                    <CalendarPlus size={13} />
                    Planifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modale de planification */}
      {planningIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1720]/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-[Space_Grotesk,sans-serif] font-semibold text-[#1A1720]">
                Planifier la variante {planningIndex + 1}
              </h2>
              <button
                onClick={() => setPlanningIndex(null)}
                className="text-[#9C96B5] hover:text-[#1A1720] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1720] mb-1.5">
                Date de publication
              </label>
              <input
                type="date"
                value={planningDate}
                onChange={(e) => setPlanningDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmPlanifier}
                disabled={!planningDate || planning}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1A1720] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#2A2632] disabled:opacity-40 transition-colors"
              >
                {planning ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Planification…
                  </>
                ) : (
                  "Confirmer"
                )}
              </button>
              <button
                onClick={() => setPlanningIndex(null)}
                className="flex-1 border border-[#1A1720]/10 text-[#6B6579] text-sm font-medium py-2.5 rounded-lg hover:bg-[#F4F5F1] transition-colors"
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
