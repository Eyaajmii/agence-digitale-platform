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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/collaborateurs"
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Collaborateurs
        </Link>
        <span className="text-zinc-200">/</span>
        <span className="text-zinc-900 font-medium">Nouveau collaborateur</span>
      </nav>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Informations du collaborateur
          </h2>

          {/* Email en premier — clé auth */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Email professionnel <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="collaborateur@agence.com"
              className="w-full rounded-lg border border-zinc-200 bg-white text-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            <p className="text-xs text-zinc-400">
              Un email d'invitation sera envoyé à cette adresse pour définir le mot de passe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={(e) => setField("nom", e.target.value)}
                placeholder="Nom"
                className="w-full rounded-lg border border-zinc-200 bg-white text-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">
                Prénom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.prenom}
                onChange={(e) => setField("prenom", e.target.value)}
                placeholder="Prénom"
                className="w-full rounded-lg border border-zinc-200 bg-white text-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Téléphone
            </label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => setField("telephone", e.target.value)}
              placeholder="+216 XX XXX XXX"
              className="w-full rounded-lg border border-zinc-200 bg-white text-zinc-900 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </section>

        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Envoi de l'invitation…
              </>
            ) : (
              "Créer et inviter"
            )}
          </button>
          <Link
            href="/dashboard/collaborateurs"
            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}