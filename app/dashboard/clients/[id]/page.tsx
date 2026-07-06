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
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Mail,
  Building2,
  Mic2,
  ShieldAlert,
  UserCog,
  CalendarClock,
  FileText,
  Plus,
  X,
} from "lucide-react";

// ─── Petits composants utilitaires ─────────────────────────────

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
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-[#9C96B5]" />
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

function StatusPill({ statut }: { statut: string | null }) {
  const actif = statut === "actif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${
        actif ? "bg-emerald-50 text-emerald-700" : "bg-[#1A1720]/5 text-[#6B6579]"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${actif ? "bg-emerald-500" : "bg-[#9C96B5]"}`} />
      {actif ? "Actif" : statut || "En attente"}
    </span>
  );
}

// ─── Vue détaillée du client ───────────────────────────────────

function ClientView({
  client,
  onEdit,
  onDelete,
  isCollaborateur,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  isCollaborateur: boolean;
}) {
  const collaborateurName = client.collaborateurs?.profiles
    ? `${client.collaborateurs.profiles.prenom ?? ""} ${client.collaborateurs.profiles.nom ?? ""}`.trim()
    : null;

  return (
    <div className="space-y-6">
      {/* En-tête client */}
      <div className="relative overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-white p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF3D7F]/15 to-[#6C4CFF]/15 text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#FF3D7F]">
              {client.nom?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720]">
                {client.nom}
              </h2>
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                <StatusPill statut={client.statut} />
                {client.secteur && (
                  <span className="rounded-full bg-[#6C4CFF]/10 px-2.5 py-1 text-xs font-medium text-[#6C4CFF] font-[IBM_Plex_Mono,monospace]">
                    {client.secteur}
                  </span>
                )}
                {client.ton && (
                  <span className="rounded-full bg-[#1A1720]/5 px-2.5 py-1 text-xs text-[#6B6579] capitalize font-[IBM_Plex_Mono,monospace]">
                    {client.ton}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isCollaborateur && (
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
          )}
        </div>
      </div>

      {/* Grille d'informations complètes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={Mail} label="Email">
          <p className="text-sm font-medium text-[#1A1720] break-all">
            {client.email || "—"}
          </p>
        </InfoCard>

        <InfoCard icon={UserCog} label="Collaborateur assigné">
          <p className="text-sm font-medium text-[#1A1720]">
            {collaborateurName || "Non assigné"}
          </p>
        </InfoCard>

        <InfoCard icon={Building2} label="Secteur d'activité">
          <p className="text-sm font-medium text-[#1A1720]">
            {client.secteur || "—"}
          </p>
        </InfoCard>

        <InfoCard icon={Mic2} label="Ton éditorial">
          <p className="text-sm font-medium text-[#1A1720] capitalize">
            {client.ton || "—"}
          </p>
        </InfoCard>

        <InfoCard icon={CalendarClock} label="Client depuis">
          <p className="text-sm font-medium text-[#1A1720]">
            {client.created_at
              ? new Date(client.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </p>
        </InfoCard>

        <InfoCard icon={FileText} label="Exemples enregistrés">
          <p className="text-sm font-medium text-[#1A1720]">
            {client.exemples?.length ?? 0} contenu
            {(client.exemples?.length ?? 0) > 1 ? "s" : ""} référence
          </p>
        </InfoCard>
      </div>

      {/* Mots interdits */}
      {client.mots_interdits && client.mots_interdits.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-white p-6">
          <span className="absolute left-0 top-0 h-full w-[3px] bg-[#FF3D7F]" />
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={14} className="text-[#9C96B5]" />
            <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
              Mots interdits
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {client.mots_interdits.map((mot) => (
              <span
                key={mot}
                className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600"
              >
                {mot}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Exemples de contenus */}
      {client.exemples && client.exemples.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace] px-1">
            Exemples de contenus
          </h3>
          <div className="space-y-3">
            {client.exemples.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#1A1720]/10 bg-white p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#1A1720]/5 px-2.5 py-1 text-xs font-medium text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
                    {PLATFORM_LABELS[ex.platforme] ?? ex.platforme}
                  </span>
                  {ex.performance && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${
                        ex.performance === "excellent"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {ex.performance}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#1A1720] whitespace-pre-wrap leading-relaxed">
                  {ex.text}
                </p>
              </div>
            ))}
          </div>
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
    email: client.email ?? "",
    statut: client.statut ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);non

  useEffect(() => {
    async function loadCollaborateurs() {
      const data = await getCollaborateurs();
      setCollaborateurs(data ?? []);
    }
    loadCollaborateurs();
  }, []);

  function set<K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addExemple() {
    set("exemples", [...form.exemples, { platforme: "instagram", text: "" }]);
  }

  function updateExemple(i: number, field: keyof Exemple, value: string) {
    set(
      "exemples",
      form.exemples.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex))
    );
  }

  function removeExemple(i: number) {
    set("exemples", form.exemples.filter((_, idx) => idx !== i));
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

  const inputClass =
    "w-full rounded-lg border border-[#1A1720]/10 bg-white px-3.5 py-2.5 text-sm text-[#1A1720] outline-none focus:border-[#6C4CFF] focus:ring-2 focus:ring-[#6C4CFF]/15 transition-all";
  const labelClass = "block text-sm font-medium text-[#1A1720] mb-1.5";
  const sectionLabelClass =
    "text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Infos générales */}
      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6 space-y-4">
        <h2 className={sectionLabelClass}>Infos générales</h2>

        <div>
          <label className={labelClass}>
            Nom <span className="text-[#FF3D7F]">*</span>
          </label>
          <input
            required
            type="text"
            value={form.nom}
            onChange={(e) => set("nom", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Email <span className="text-[#FF3D7F]">*</span>
          </label>
          <input
            required
            type="text"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Secteur</label>
            <select
              value={form.secteur}
              onChange={(e) => set("secteur", e.target.value as ClientFormData["secteur"])}
              className={inputClass}
            >
              {SECTOR_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Ton</label>
            <select
              value={form.ton}
              onChange={(e) => set("ton", e.target.value as ClientFormData["ton"])}
              className={inputClass}
            >
              {TON_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Statut</label>
            <select
              value={form.statut}
              onChange={(e) => set("statut", e.target.value as ClientFormData["statut"])}
              className={inputClass}
            >
              <option value="actif">Actif</option>
              <option value="en attente">En attente</option>
            </select>
          </div>
        </div>
      </section>

      {/* Profil IA */}
      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6 space-y-4">
        <h2 className={sectionLabelClass}>Profil IA</h2>
        <div>
          <label className={labelClass}>Mots interdits</label>
          <input
            type="text"
            value={form.mots_interdits}
            onChange={(e) => set("mots_interdits", e.target.value)}
            placeholder="pas cher, discount…"
            className={inputClass}
          />
          <p className="text-xs text-[#9C96B5] mt-1.5">Séparés par des virgules</p>
        </div>
      </section>

      {/* Affectation */}
      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6 space-y-4">
        <h2 className={sectionLabelClass}>Affectation</h2>
        <div>
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
      </section>

      {/* Exemples */}
      <section className="rounded-2xl border border-[#1A1720]/10 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={sectionLabelClass}>Exemples</h2>
          <button
            type="button"
            onClick={addExemple}
            className="flex items-center gap-1.5 rounded-lg bg-[#6C4CFF]/10 px-3 py-1.5 text-xs font-medium text-[#6C4CFF] hover:bg-[#6C4CFF]/15 transition-colors"
          >
            <Plus size={13} />
            Ajouter
          </button>
        </div>

        {form.exemples.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#1A1720]/15 py-6 text-center text-xs text-[#9C96B5]">
            Aucun exemple
          </p>
        ) : (
          <div className="space-y-3">
            {form.exemples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-[#1A1720]/10 bg-[#F4F5F1] p-4 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <select
                    value={ex.platforme}
                    onChange={(e) => updateExemple(i, "platforme", e.target.value)}
                    className="rounded-md border border-[#1A1720]/10 bg-white px-2.5 py-1.5 text-xs outline-none"
                  >
                    {(Object.keys(PLATFORM_LABELS) as Platforme[]).map((p) => (
                      <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <select
                      value={ex.performance ?? ""}
                      onChange={(e) => updateExemple(i, "performance", e.target.value)}
                      className="rounded-md border border-[#1A1720]/10 bg-white px-2.5 py-1.5 text-xs outline-none"
                    >
                      <option value="">Performance</option>
                      <option value="bon">Bon</option>
                      <option value="excellent">Excellent</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeExemple(i)}
                      className="flex items-center gap-1 text-xs text-[#9C96B5] hover:text-[#FF3D7F] transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <textarea
                  rows={3}
                  value={ex.text}
                  onChange={(e) => updateExemple(i, "text", e.target.value)}
                  className="w-full rounded-md border border-[#1A1720]/10 bg-white px-3 py-2 text-xs outline-none resize-none focus:border-[#6C4CFF]"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[#1A1720] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2A2632] disabled:opacity-50 transition-colors"
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
  const { data: session } = useSession();
  const isCollaborateur = session?.user?.role?.toLowerCase() === "collaborateur";

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
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF3D7F] border-t-transparent" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1A1720]/15 bg-white p-12 text-center text-sm text-[#6B6579]">
        Client introuvable.{" "}
        <Link href="/dashboard/clients" className="text-[#6C4CFF] font-medium hover:underline">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-[Inter,sans-serif]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-1 text-sm text-[#9C96B5] hover:text-[#1A1720] transition-colors"
        >
          <ChevronLeft size={15} />
          Clients
        </Link>
        <span className="text-[#1A1720]/15">/</span>
        <span className="text-sm text-[#1A1720] font-medium">{client.nom}</span>
        {editMode && (
          <>
            <span className="text-[#1A1720]/15">/</span>
            <span className="text-sm text-[#9C96B5]">Modifier</span>
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
          isCollaborateur={isCollaborateur}
        />
      )}
    </div>
  );
}