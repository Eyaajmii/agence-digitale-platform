//Liste des clients
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getClients } from "@/lib/supabase/client";
import { deleteClient } from "@/lib/supabase/client";
import type { Client, PaginatedClients } from "@/types/clients";

const SECTOR_COLORS: Record<string, string> = {
  "E-commerce": "bg-violet-50 text-violet-700",
  Immobilier: "bg-blue-50 text-blue-700",
  Restauration: "bg-orange-50 text-orange-700",
  "Mode & Beauté": "bg-pink-50 text-pink-700",
  "Tech & SaaS": "bg-cyan-50 text-cyan-700",
  "Santé & Bien-être": "bg-green-50 text-green-700",
  Finance: "bg-emerald-50 text-emerald-700",
  Éducation: "bg-amber-50 text-amber-700",
  Tourisme: "bg-sky-50 text-sky-700",
  Sport: "bg-lime-50 text-lime-700",
  Autre: "bg-zinc-100 text-zinc-600",
};

function getInitials(nom: string) {
  return nom
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getAvatarColor(nom: string) {
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-teal-100 text-teal-700",
    "bg-pink-100 text-pink-700",
    "bg-amber-100 text-amber-700",
  ];
  return colors[nom.charCodeAt(0) % colors.length];
}

export default function ClientsPage() {
  const [result, setResult] = useState<PaginatedClients | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Clients</h1>
          {result && (
            <p className="mt-0.5 text-sm text-zinc-500">
              {result.total} client{result.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/clients/addClient"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          + Nouveau client
        </Link>
      </div>

      {/* Recherche */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher un client…"
          className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />
        <button
          type="submit"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
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
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        )}
      </form>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        </div>
      ) : result?.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-20 text-center">
          <p className="text-zinc-400 text-sm">
            {search
              ? `Aucun résultat pour « ${search} »`
              : "Aucun client pour le moment."}
          </p>
          {!search && (
            <Link
              href="/dashboard/clients/addClient"
              className="mt-3 inline-block text-sm font-medium text-violet-600 hover:underline"
            >
              Créer votre premier client →
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-3 text-left">Client</th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">
                  Secteur
                </th>
                <th className="hidden px-4 py-3 text-left md:table-cell">
                  Ton
                </th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  Exemples
                </th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  Collaborateur
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {result?.data.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  {/* Nom + initiales */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                          client.nom
                        )}`}
                      >
                        {getInitials(client.nom)}
                      </div>
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-medium text-zinc-900 hover:text-violet-600 transition-colors"
                      >
                        {client.nom}
                      </Link>
                    </div>
                  </td>

                  {/* Secteur */}
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {client.secteur ? (
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          SECTOR_COLORS[client.secteur] ??
                          "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {client.secteur}
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>

                  {/* Ton */}
                  <td className="hidden px-4 py-3 text-zinc-500 capitalize md:table-cell">
                    {client.ton ?? <span className="text-zinc-300">—</span>}
                  </td>

                  {/* Nb exemples */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-zinc-400 text-xs">
                      {client.exemples?.length ?? 0} exemple
                      {(client.exemples?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {client.collaborateurs?.profiles ? (
                      <>
                        {client.collaborateurs.profiles.nom}{" "}
                        {client.collaborateurs.profiles.prenom}
                      </>
                    ) : (
                      <span className="text-red-400">Pas encore affecté</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="rounded-md px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/dashboard/clients/${client.id}?edit=1`}
                        className="rounded-md px-2.5 py-1 text-xs text-violet-600 hover:bg-violet-50 transition-colors"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(client)}
                        disabled={deletingId === client.id}
                        className="rounded-md px-2.5 py-1 text-xs text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        {deletingId === client.id ? "…" : "Supprimer"}
                      </button>
                      <a href={`/api/auth/meta?clientId=${client.id}`}>
                        Connecter Meta
                      </a>

                      <a href={`/api/auth/google?clientId=${client.id}`}>
                        Connecter Google
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {result && result.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-zinc-400">
            Page {result.page} / {result.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
            >
              ← Précédent
            </button>
            <button
              disabled={page === result.total_pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
