"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getCollabById,
  updateCollaborateur,
  deleteCollaborateur,
} from "@/lib/supabase/collaborateur";
import type { Collaborateur, CollaborateurFormData } from "@/types/users";

// ─── Vue détail ───────────────────────────────────────────────
function CollaborateurView({
  collaborateur,
  onEdit,
  onDelete,
}: {
  collaborateur: Collaborateur;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const profile = collaborateur.profiles;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-lg font-semibold">
              {profile.nom?.[0]?.toUpperCase()}
              {profile.prenom?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {profile.nom} {profile.prenom}
              </h2>
              <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                {profile.role}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="rounded-lg border border-red-100 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Infos */}
        <div className="border-t border-zinc-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-400 mb-1">Nom</p>
            <p className="text-sm text-zinc-800 font-medium">{profile.nom}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Prénom</p>
            <p className="text-sm text-zinc-800 font-medium">{profile.prenom}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Téléphone</p>
            <p className="text-sm text-zinc-800">
              {profile.telephone || <span className="text-zinc-300">—</span>}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Membre depuis</p>
            <p className="text-sm text-zinc-800">
              {new Date(profile.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Formulaire édition ───────────────────────────────────────
function CollaborateurEditForm({
  collaborateur,
  onSave,
  onCancel,
}: {
  collaborateur: Collaborateur;
  onSave: (updated: Collaborateur) => void;
  onCancel: () => void;
}) {
  const profile = collaborateur.profiles;

  const [form, setForm] = useState<CollaborateurFormData>({
    nom: profile.nom,
    prenom: profile.prenom,
    telephone: profile.telephone ?? "",
    email:profile.email??"",
  });
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
      const updatedProfile = await updateCollaborateur(collaborateur.id, form);
      // Reconstruire le Collaborateur complet avec le profil mis à jour
      onSave({ ...collaborateur, profiles: updatedProfile });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Infos générales */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Infos générales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Nom <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={form.nom}
              onChange={(e) => setField("nom", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Prénom <span className="text-red-400">*</span>
            </label>
            <input
              required
              type="text"
              value={form.prenom}
              onChange={(e) => setField("prenom", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enregistrement…
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

// ─── Page principale ──────────────────────────────────────────
export default function CollaborateurPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [collaborateur, setCollab] = useState<Collaborateur | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "1");

  useEffect(() => {
    async function load() {
      try {
        const data = await getCollabById(params.id as string);
        setCollab(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleDelete() {
    if (!collaborateur) return;
    if (
      !confirm(
        `Supprimer « ${collaborateur.profiles.nom} ${collaborateur.profiles.prenom} » ? Action irréversible.`
      )
    )
      return;
    await deleteCollaborateur(collaborateur.id);
    router.push("/dashboard/collaborateurs");
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  // ── Not found ──
  if (!collaborateur) {
    return (
      <div className="p-6 text-center text-sm text-zinc-400">
        Collaborateur introuvable.{" "}
        <Link
          href="/dashboard/collaborateurs"
          className="text-violet-600 hover:underline"
        >
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard/collaborateurs"
          className="text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Collaborateurs
        </Link>
        <span className="text-zinc-200">/</span>
        <span className="text-zinc-600">
          {collaborateur.profiles.nom} {collaborateur.profiles.prenom}
        </span>
        {editMode && (
          <>
            <span className="text-zinc-200">/</span>
            <span className="text-zinc-400">Modifier</span>
          </>
        )}
      </nav>

      {/* Contenu */}
      {editMode ? (
        <CollaborateurEditForm
          collaborateur={collaborateur}
          onSave={(updated) => {
            setCollab(updated);
            setEditMode(false);
          }}
          onCancel={() => setEditMode(false)}
        />
      ) : (
        <CollaborateurView
          collaborateur={collaborateur}
          onEdit={() => setEditMode(true)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}