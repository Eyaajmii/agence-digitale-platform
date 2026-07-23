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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      {" "}
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-[#9C96B5]" />
        <p className="text-[11px]font-medium uppercase tracking-wider text-slate-400">
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
              {profile.nom?.[0]?.toUpperCase()}
              {profile.prenom?.[0]?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720]">
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
              className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Pencil size={14} />
              Modifier
            </button>

            <button
              onClick={onDelete}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="grid gap-5 lg:grid-cols-3">
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
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
  const labelClass = "mb-1 block text-sm font-medium text-slate-700";
  const sectionLabelClass = "mb-4 text-base font-semibold text-slate-900";
  return (
    <div className="max-w-5xl mx-auto p-6">
      {" "}
      <div className="mb-6">
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Modifier les informations
        </h1>
        <p className="mt-1 text-slate-500">
          Modifier les informations d'un collaborateur.
        </p>
      </div>
      {error && (
        <div className="rounded-lg border border-[#FF3D7F]/30 bg-[#FF3D7F]/10 px-4 py-3 text-sm text-[#c72c68]">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {" "}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Infos générales */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className={sectionLabelClass}>Infos générales</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
            <label className={labelClass}>
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.nom}
                  onChange={(e) => setField("nom", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
              <label className={labelClass}>
                  Prénom <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setField("prenom", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
            <label className={labelClass}>
                Téléphone
              </label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setField("telephone", e.target.value)}
                placeholder="+216 XX XXX XXX"
                className={inputClass}
                />
            </div>
          </section>

          {/* Actions */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/90 backdrop-blur-sm p-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-blue-500 bg-white px-4 py-3 text-sm outline-none resize-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
              className="rounded-lg border border-[#1A1720]/10 px-5 py-2.5 text-sm font-medium text-[#6B6579] hover:bg-[#F4F5F1] transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

    setIsDeleting(true);

    try {
      await deleteCollaborateur(collaborateur.profiles.id);
      router.push("/dashboard/collaborateurs");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
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
          onDelete={() => setShowDeleteModal(true)}
        />
      )}
      {showDeleteModal && collaborateur && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Supprimer le collaborateur
                </h3>

                <p className="text-sm text-slate-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Voulez-vous vraiment supprimer :
              </p>

              <p className="mt-2 font-semibold text-slate-900">{collaborateur.profiles.nom} {collaborateur.profiles.prenom}</p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
