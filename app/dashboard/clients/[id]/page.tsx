"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getClientById,
  updateClient,
  deleteClient,
} from "@/lib/supabase/client";
import type {
  Client,
  ClientFormData,
  Exemple,
  Platforme,
} from "@/types/clients";
import { SECTOR_OPTIONS, TON_OPTIONS, PLATFORM_LABELS } from "@/types/clients";
import { getCollaborateurs } from "@/lib/supabase/collaborateur";

function ClientView({
  client,
  onEdit,
  onDelete,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Carte principale */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              {client.nom}
            </h2>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {client.secteur && (
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  {client.secteur}
                </span>
              )}
              {client.ton && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 capitalize">
                  {client.ton}
                </span>
              )}
              {client.statut && (
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 capitalize">
                  {client.statut}
                </span>
              )}
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

        {/* Mots interdits */}
        {client.mots_interdits && client.mots_interdits.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Mots interdits
            </p>
            <div className="flex flex-wrap gap-1.5">
              {client.mots_interdits.map((mot) => (
                <span
                  key={mot}
                  className="rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-600"
                >
                  {mot}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Métadonnées */}
        <div className="border-t border-zinc-100 pt-4 grid grid-cols-2 gap-4 text-xs text-zinc-400">
          <div>
            <p className="font-medium text-zinc-500">Créé le</p>
            <p>
              {client.created_at
                ? new Date(client.created_at).toLocaleDateString("fr-FR")
                : "—"}
            </p>
          </div>
          <div>
            <p className="font-medium text-zinc-500">Exemples</p>
            <p>
              {client.exemples?.length ?? 0} enregistré
              {(client.exemples?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {client.exemples && client.exemples.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Exemples de contenus
          </h3>
          {client.exemples.map((ex, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {PLATFORM_LABELS[ex.platforme] ?? ex.platforme}
                </span>
                {ex.performance && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      ex.performance === "excellent"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {ex.performance}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                {ex.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Formulaire édition ───────────────────────────────────────
function ClientEditForm({
  client,
  onSave,
  onCancel,
}: {
  client: Client;
  onSave: (updated: Client) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ClientFormData>({
    nom: client.nom,
    secteur: client.secteur ?? "E-commerce",
    ton: client.ton ?? "professionnel",
    mots_interdits: (client.mots_interdits ?? []).join(", "),
    exemples: client.exemples ?? [],
    collaborateur_id: client.collaborateur_id ?? "",
    email:client.email??"",
    statut:client.statut??"",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);

  useEffect(() => {
    async function loadCollaborateurs() {
      const data = await getCollaborateurs();
      setCollaborateurs(data ?? []);
    }

    loadCollaborateurs();
  }, []);
  function set<K extends keyof ClientFormData>(
    key: K,
    value: ClientFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await updateClient(client.id, form);
      onSave(updated);
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
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Infos générales
        </h2>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700">
            Nom <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="text"
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            required
            type="text"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Secteur
            </label>
            <select
              value={form.secteur}
              onChange={(e) =>
                set("secteur", e.target.value as ClientFormData["secteur"])
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500"
            >
              {SECTOR_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Ton
            </label>
            <select
              value={form.ton}
              onChange={(e) =>
                set("ton", e.target.value as ClientFormData["ton"])
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500"
            >
              {TON_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Statut
            </label>
            <select
              value={form.statut}
              onChange={(e) =>
                set("statut", e.target.value as ClientFormData["statut"])
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500"
            >
              <option value="actif" >Actif</option>
              <option value="en attente" >En attente</option>
            </select>
          </div>
        </div>
      </section>

      {/* Profil IA */}
      <section className="space-y-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Profil IA
        </h2>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-zinc-700">
            Mots interdits
          </label>
          <input
            type="text"
            value={form.mots_interdits}
            onChange={(e) => set("mots_interdits", e.target.value)}
            placeholder="pas cher, discount…"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
          <p className="text-xs text-zinc-400">Séparés par des virgules</p>
        </div>
      </section>

      {/* Exemples */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Exemples
          </h2>
          <button
            type="button"
            onClick={addExemple}
            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {form.exemples.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-200 py-6 text-center text-xs text-zinc-400">
            Aucun exemple
          </p>
        ) : (
          <div className="space-y-3">
            {form.exemples.map((ex, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <select
                    value={ex.platforme}
                    onChange={(e) =>
                      updateExemple(i, "platforme", e.target.value)
                    }
                    className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs outline-none"
                  >
                    {(Object.keys(PLATFORM_LABELS) as Platforme[]).map((p) => (
                      <option key={p} value={p}>
                        {PLATFORM_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <select
                      value={ex.performance ?? ""}
                      onChange={(e) =>
                        updateExemple(i, "performance", e.target.value)
                      }
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs outline-none"
                    >
                      <option value="">Performance</option>
                      <option value="bon">Bon</option>
                      <option value="excellent">Excellent</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeExemple(i)}
                      className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={ex.text}
                  onChange={(e) => updateExemple(i, "text", e.target.value)}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs outline-none resize-none focus:border-violet-500"
                />
              </div>
            ))}
          </div>
        )}
        <section className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Affectation
          </h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Collaborateur
            </label>

            <select
              value={form.collaborateur_id}
              onChange={(e) => set("collaborateur_id", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Sélectionner un collaborateur</option>

              {collaborateurs.map((collab) => (
                <option key={collab.id} value={collab.id}>
                  {collab.profiles?.nom} {collab.profiles?.prenom}
                </option>
              ))}
            </select>
          </div>
        </section>
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

// ─── Page principale ─────────────────────────────────────────
export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(isEdit);

  useEffect(() => {
    async function load() {
      try {
        const data = await getClientById(params.id as string);
        setClient(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleDelete() {
    if (!client) return;
    if (!confirm(`Supprimer « ${client.nom} » ? Action irréversible.`)) return;
    await deleteClient(client.id);
    router.push("/dashboard/clients");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center text-sm text-zinc-400">
        Client introuvable.{" "}
        <Link
          href="/dashboard/clients"
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
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Clients
        </Link>
        <span className="text-zinc-200">/</span>
        <span className="text-sm text-zinc-600">{client.nom}</span>
        {editMode && (
          <>
            <span className="text-zinc-200">/</span>
            <span className="text-sm text-zinc-400">Modifier</span>
          </>
        )}
      </div>

      {/* Contenu */}
      {editMode ? (
        <ClientEditForm
          client={client}
          onSave={(updated) => {
            setClient(updated);
            setEditMode(false);
          }}
          onCancel={() => setEditMode(false)}
        />
      ) : (
        <ClientView
          client={client}
          onEdit={() => setEditMode(true)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
