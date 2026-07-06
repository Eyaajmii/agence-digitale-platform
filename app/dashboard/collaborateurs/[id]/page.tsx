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
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  CalendarClock,
  UserCog,
} from "lucide-react";
function InfoCard({
  icon: Icon,
  label,
  children,
}: {
  icon: any;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1A1720]/10 bg-white p-5">
      <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#FF3D7F] to-[#6C4CFF]" />

      <div className="mb-2 flex items-center gap-2">
        <Icon size={14} className="text-[#9C96B5]" />

        <p className="text-[10px] uppercase tracking-[0.15em] text-[#9C96B5] font-medium font-[IBM_Plex_Mono,monospace]">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}
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
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-white p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF3D7F]/15 to-[#6C4CFF]/15 text-xl font-bold text-[#FF3D7F] font-[Space_Grotesk,sans-serif]">
              {profile.nom?.[0]?.toUpperCase()}
              {profile.prenom?.[0]?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#1A1720] font-[Space_Grotesk,sans-serif]">
                {profile.nom} {profile.prenom}
              </h2>

              <span className="mt-2 inline-flex rounded-full bg-[#6C4CFF]/10 px-2.5 py-1 text-xs font-medium text-[#6C4CFF] font-[IBM_Plex_Mono,monospace]">
                {profile.role}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-lg border border-[#1A1720]/10 px-3.5 py-2 text-sm font-medium text-[#1A1720] hover:bg-[#F4F5F1] transition-colors"
            >
              <Pencil size={14} />
              Modifier
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 rounded-lg border border-[#FF3D7F]/25 px-3.5 py-2 text-sm font-medium text-[#FF3D7F] hover:bg-[#FF3D7F]/10 transition-colors"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={Mail} label="Email">
          <p className="text-sm font-medium text-[#1A1720]">
            {profile.email || "—"}
          </p>
        </InfoCard>

        <InfoCard icon={Phone} label="Téléphone">
          <p className="text-sm font-medium text-[#1A1720]">
            {profile.telephone || "—"}
          </p>
        </InfoCard>

        <InfoCard icon={UserCog} label="Rôle">
          <p className="text-sm font-medium text-[#1A1720]">{profile.role}</p>
        </InfoCard>

        <InfoCard icon={CalendarClock} label="Membre depuis">
          <p className="text-sm font-medium text-[#1A1720]">
            {new Date(profile.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </InfoCard>
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
    email: profile.email ?? "",
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
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FF3D7F] focus:ring-2 focus:ring-[#FF3D7F]/15"
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
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FF3D7F] focus:ring-2 focus:ring-[#FF3D7F]/15"
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
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[#FF3D7F] focus:ring-2 focus:ring-[#FF3D7F]/15"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[#FF3D7F] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e02f6c] disabled:opacity-50 transition-colors"
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF3D7F] border-t-transparent" />
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
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/collaborateurs"
          className="flex items-center gap-1 text-sm text-[#9C96B5] hover:text-[#1A1720] transition-colors"
        >
          <ChevronLeft size={15} />
          Collaborateurs
        </Link>

        <span className="text-[#1A1720]/15">/</span>

        <span className="text-sm font-medium text-[#1A1720]">
          {collaborateur.profiles.nom} {collaborateur.profiles.prenom}
        </span>

        {editMode && (
          <>
            <span className="text-[#1A1720]/15">/</span>
            <span className="text-sm text-[#9C96B5]">Modifier</span>
          </>
        )}
      </div>

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
