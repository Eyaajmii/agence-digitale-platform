"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addCollaborateur } from "@/lib/supabase/collaborateur";
import type { CollaborateurFormData } from "@/types/users";

const emptyForm: CollaborateurFormData = {
  nom: "",
  prenom: "",
  telephone: "",
  email: "",
};

export default function AddCollaborateurPage() {
  const router = useRouter();
  const [form, setForm] = useState<CollaborateurFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof CollaborateurFormData>(
    key: K,
    value: CollaborateurFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await addCollaborateur(form);
      router.push("/dashboard/collaborateurs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const sectionTitleClass = "mb-4 text-base font-semibold text-slate-900";
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/collaborateurs"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Collaborateurs
        </Link>

        <span className="text-[#D9D5E0]">/</span>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Nouveau collaborateur
        </h1>
      </div>
      <p className="mt-1 text-slate-500">
        Créez un nouveau collaborateur et configurez son profil professionnel.
      </p>
      {error && (
        <div className="rounded-lg border border-[#FF3D7F]/30 bg-[#FF3D7F]/10 px-4 py-3 text-sm text-[#c72c68]">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className={sectionTitleClass}>Informations du collaborateur</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>
                  Nom <span className="text-[#FF3D7F]">*</span>
                </label>

                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setField("nom", e.target.value)}
                  placeholder="Nom"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>
                  Prénom <span className="text-[#FF3D7F]">*</span>
                </label>

                <input
                  type="text"
                  required
                  value={form.prenom}
                  onChange={(e) => setField("prenom", e.target.value)}
                  placeholder="Prénom"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>
                  Email professionnel <span className="text-[#FF3D7F]">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="collaborateur@agence.com"
                  className={inputClass}
                />
                <p className="text-xs text-[#9C96B5]">
                  Un email d'invitation sera envoyé pour permettre au
                  collaborateur de définir son mot de passe.
                </p>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Téléphone</label>

                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setField("telephone", e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Aperçu */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className={sectionTitleClass}>Aperçu</h2>
            <div className="rounded-lg border border-[#1A1720]/10 bg-[#F4F5F1] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6C4CFF]/10 text-[#6C4CFF] font-[Space_Grotesk,sans-serif] font-semibold">
                  {(form.nom?.[0] || "").toUpperCase()}
                  {(form.prenom?.[0] || "").toUpperCase()}
                </div>

                <div>
                  <p className="font-medium text-[#1A1720]">
                    {form.nom || "Nom"} {form.prenom || "Prénom"}
                  </p>

                  <p className="text-sm text-[#6B6579]">
                    {form.email || "collaborateur@agence.com"}
                  </p>
                </div>
              </div>
            </div>
          </section>
          {/* Actions */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/90 backdrop-blur-sm p-6">
          <button type="submit" disabled={loading} className="w-full rounded-xl border border-blue-500 bg-white px-4 py-3 text-sm outline-none resize-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Création...
                </>
              ) : (
                "Créer et inviter"
              )}
            </button>

            <Link
              href="/dashboard/collaborateurs"
              className="rounded-lg border border-[#1A1720]/10 px-5 py-2.5 text-sm font-medium text-[#6B6579] hover:bg-[#1A1720]/5 transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
