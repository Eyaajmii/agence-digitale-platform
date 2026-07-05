"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addClient } from "@/lib/supabase/client";
import type { ClientFormData, Exemple, Platforme } from "@/types/clients";
import { SECTOR_OPTIONS, TON_OPTIONS, PLATFORM_LABELS } from "@/types/clients";
import { getCollaborateurs } from "@/lib/supabase/collaborateur";

const emptyForm: ClientFormData = {
  nom: "",
  secteur: "E-commerce",
  ton: "professionnel",
  mots_interdits: "",
  exemples: [],
  collaborateur_id: "",
  email: "",
  statut: "actif",
};

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  useEffect(() => {
    async function load() {
      const data = await getCollaborateurs();
      setCollaborateurs(data);
    }

    load();
  }, []);
  function set<K extends keyof ClientFormData>(
    key: K,
    value: ClientFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // ── Exemples ──────────────────────────────────────────────
  function addExemple() {
    set("exemples", [...form.exemples, { platforme: "instagram", text: "" }]);
  }

  function updateExemple(i: number, field: keyof Exemple, value: string) {
    set(
      "exemples",
      form.exemples.map((ex, idx) =>
        idx === i ? { ...ex, [field]: value } : ex
      )
    );
  }

  function removeExemple(i: number) {
    set(
      "exemples",
      form.exemples.filter((_, idx) => idx !== i)
    );
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const client = await addClient(form);
      router.push(`/dashboard/clients`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#1A1720]/10 bg-white px-3 py-2 text-sm text-[#1A1720] outline-none focus:border-[#FF3D7F] focus:ring-2 focus:ring-[#FF3D7F]/15 transition-colors";
  const labelClass = "block text-sm font-medium text-[#1A1720]/80";
  const sectionTitleClass =
    "text-[10px] font-medium uppercase tracking-[0.2em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="text-sm text-[#9C96B5] hover:text-[#1A1720] transition-colors"
        >
          ← Clients
        </Link>
        <span className="text-[#D9D5E0]">/</span>
        <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
          Nouveau client
        </h1>
      </div>

      {error && (
        <div className="rounded-lg border border-[#FF3D7F]/30 bg-[#FF3D7F]/10 px-4 py-3 text-sm text-[#c72c68]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Infos générales ─────────────────────────────── */}
        <section className="space-y-4">
          <h2 className={sectionTitleClass}>Infos générales</h2>

          <div className="space-y-1">
            <label className={labelClass}>
              Nom du client <span className="text-[#FF3D7F]">*</span>
            </label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Ex : Boutique Élara"
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Email du client</label>
            <input
              type="text"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Ex : contact@gmail.com"
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Collaborateur</label>

            <select
              value={form.collaborateur_id}
              onChange={(e) => set("collaborateur_id", e.target.value)}
              className={inputClass}
            >
              <option value="">Sélectionner un collaborateur</option>

              {collaborateurs.map((collab) => (
                <option key={collab.id} value={collab.id}>
                  {collab.profiles?.nom} {collab.profiles?.prenom}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Secteur</label>
              <select
                value={form.secteur}
                onChange={(e) =>
                  set("secteur", e.target.value as ClientFormData["secteur"])
                }
                className={inputClass}
              >
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Ton</label>
              <select
                value={form.ton}
                onChange={(e) =>
                  set("ton", e.target.value as ClientFormData["ton"])
                }
                className={inputClass}
              >
                {TON_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Statut</label>
              <select
                value={form.statut}
                onChange={(e) => set("statut", e.target.value)}
                className={inputClass}
              >
                <option value="">Choisir un statut</option>
                <option value="actif">Actif</option>
                <option value="en attente">En attente</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── Profil IA ────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className={sectionTitleClass}>Profil IA</h2>

          <div className="space-y-1">
            <label className={labelClass}>Mots interdits</label>
            <input
              type="text"
              value={form.mots_interdits}
              onChange={(e) => set("mots_interdits", e.target.value)}
              placeholder="pas cher, discount, promo…"
              className={inputClass}
            />
            <p className="text-xs text-[#9C96B5]">Séparés par des virgules</p>
          </div>
        </section>

        {/* ── Exemples few-shot ────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={sectionTitleClass}>Exemples de contenus</h2>
            <button
              type="button"
              onClick={addExemple}
              className="rounded-lg border border-[#6C4CFF]/30 bg-[#6C4CFF]/10 px-3 py-1 text-xs font-medium text-[#6C4CFF] hover:bg-[#6C4CFF]/20 transition-colors"
            >
              + Ajouter
            </button>
          </div>

          {form.exemples.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#1A1720]/15 py-8 text-center text-xs text-[#9C96B5]">
              Ajoutez des copies validées pour améliorer la génération IA
            </p>
          ) : (
            <div className="space-y-3">
              {form.exemples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#1A1720]/10 bg-[#F4F5F1] p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <select
                      value={ex.platforme}
                      onChange={(e) =>
                        updateExemple(i, "platforme", e.target.value)
                      }
                      className="rounded-md border border-[#1A1720]/10 bg-white px-2 py-1 text-xs outline-none focus:border-[#FF3D7F]"
                    >
                      {(Object.keys(PLATFORM_LABELS) as Platforme[]).map(
                        (p) => (
                          <option key={p} value={p}>
                            {PLATFORM_LABELS[p]}
                          </option>
                        )
                      )}
                    </select>
                    <div className="flex items-center gap-2">
                      <select
                        value={ex.performance ?? ""}
                        onChange={(e) =>
                          updateExemple(i, "performance", e.target.value)
                        }
                        className="rounded-md border border-[#1A1720]/10 bg-white px-2 py-1 text-xs outline-none focus:border-[#FF3D7F]"
                      >
                        <option value="">Performance</option>
                        <option value="bon">Bon</option>
                        <option value="excellent">Excellent</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeExemple(i)}
                        className="text-xs text-[#9C96B5] hover:text-[#FF3D7F] transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={ex.text}
                    onChange={(e) => updateExemple(i, "text", e.target.value)}
                    placeholder="Colle ici une copie publicitaire validée…"
                    className="w-full rounded-md border border-[#1A1720]/10 bg-white px-3 py-2 text-xs outline-none focus:border-[#FF3D7F] resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#1A1720]/10">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#FF3D7F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e02f6c] disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Création…
              </>
            ) : (
              "Créer le client"
            )}
          </button>
          <Link
            href="/dashboard/clients"
            className="rounded-lg border border-[#1A1720]/10 px-5 py-2.5 text-sm font-medium text-[#6B6579] hover:bg-[#1A1720]/5 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}