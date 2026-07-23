//Liste des clients
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getClients } from "@/lib/supabase/client";
import { deleteClient } from "@/lib/supabase/client";
import type { Client, PaginatedClients } from "@/types/clients";
import { useSession } from "next-auth/react";
import { Mail, MessageCircle, Link as LinkIcon, Check } from "lucide-react";

const SECTOR_COLORS = {
  "E-commerce": "bg-blue-50 text-blue-700",
  Immobilier: "bg-slate-100 text-slate-700",
  Restauration: "bg-orange-50 text-orange-700",
  "Mode & Beauté": "bg-pink-50 text-pink-700",
  "Tech & SaaS": "bg-cyan-50 text-cyan-700",
  "Santé & Bien-être": "bg-emerald-50 text-emerald-700",
  Finance: "bg-indigo-50 text-indigo-700",
  Éducation: "bg-yellow-50 text-yellow-700",
  Tourisme: "bg-sky-50 text-sky-700",
  Sport: "bg-lime-50 text-lime-700",
  Autre: "bg-slate-100 text-slate-600",
};

function getInitials(nom: string) {
  return nom
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ClientsPage() {
  const [result, setResult] = useState<PaginatedClients | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isCollaborateur =
    session?.user?.role?.toLowerCase() === "collaborateur";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClients(page, 10, search);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Supprimer « ${client.nom} » ? Action irréversible.`)) return;
    setDeletingId(client.id);
    try {
      await deleteClient(client.id);
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopyLink(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
            La liste des clients
          </h1>
          {result && (
            <p className="mt-0.5 text-sm text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
              {result.total} client{result.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {!isCollaborateur && (
          <Link
            href="/dashboard/clients/addClient"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Nouveau client
          </Link>
        )}
      </div>

      {/* Recherche */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher un client…"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Rechercher
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:text-[#1A1720]"
          >
            ✕
          </button>
        )}
      </form>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF3D7F] border-t-transparent" />
        </div>
      ) : result?.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1A1720]/15 py-20 text-center">
          <p className="text-slate-500 text-sm">
            {search
              ? `Aucun résultat pour « ${search} »`
              : "Aucun client pour le moment."}
          </p>
          {!search && !isCollaborateur && (
            <Link
              href="/dashboard/clients/addClient"
              className="mt-3 inline-block text-sm font-medium text-amber-600 hover:underline"
            >
              Créer votre premier client →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {result?.data.map((client) => (
              <div key={client.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">

              <div className="flex items-start justify-between gap-4">
                {/* Partie gauche */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-semibold">
                    {getInitials(client.nom)}
                  </div>

                  <div>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {client.nom}
                    </Link>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {client.secteur && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            SECTOR_COLORS[client.secteur] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {client.secteur}
                        </span>
                      )}

                      {client.statut && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          {client.statut}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Voir
                  </Link>

                  {!isCollaborateur && (
                    <>
                      <Link href={`/dashboard/clients/${client.id}?edit=1`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 ">
                        Modifier
                      </Link>

                      <button
                        onClick={() => handleDelete(client)}
                        disabled={deletingId === client.id}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Informations */}
              {/* Footer */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Collaborateur */}
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Collaborateur
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {client.collaborateurs?.profiles
                        ? `${client.collaborateurs.profiles.nom} ${client.collaborateurs.profiles.prenom}`
                        : "Non affecté"}
                    </p>
                  </div>

                  {/* Connexions */}
                  <div className="flex flex-wrap gap-3">
                    {(["meta", "google"] as const).map((provider) => {
                      const baseUrl =
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "";

                      const oauthUrl = `${baseUrl}/api/auth/${provider}?clientId=${client.id}`;

                      const providerLabel =
                        provider === "meta" ? "Meta Ads" : "Google Ads";

                      const message = `Bonjour ${client.nom}, pour connecter votre compte ${providerLabel} à notre agence, cliquez sur ce lien : ${oauthUrl}`;

                      const mailtoLink = client.email
                        ? `mailto:${client.email}?subject=${encodeURIComponent(
                            `Connexion ${providerLabel} — Lezarts Digital`
                          )}&body=${encodeURIComponent(message)}`
                        : null;

                      const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
                        message
                      )}`;

                      const linkId = `${client.id}-${provider}`;

                      return (
                        <div
                          key={provider}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 min-w-[220px]"
                        >
                          <span className="text-xs font-medium text-slate-700">
                            {providerLabel}
                          </span>

                          <div className="ml-auto flex items-center gap-1">
                            {mailtoLink ? (
                              <a
                                href={mailtoLink}
                                className="rounded-md p-1.5 hover:bg-white"
                              >
                                <Mail size={15} />
                              </a>
                            ) : (
                              <span className="p-1.5 text-slate-300">
                                <Mail size={15} />
                              </span>
                            )}

                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1.5 hover:bg-white"
                            >
                              <MessageCircle size={15} />
                            </a>

                            <button
                              onClick={() => handleCopyLink(oauthUrl, linkId)}
                              className="rounded-md p-1.5 hover:bg-white"
                            >
                              {copiedId === linkId ? (
                                <Check size={15} className="text-emerald-600" />
                              ) : (
                                <LinkIcon size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {result && result.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500 font-[IBM_Plex_Mono,monospace]">
            Page {result.page} / {result.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ← Précédent
            </button>
            <button
              disabled={page === result.total_pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
