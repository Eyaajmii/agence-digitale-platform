//Liste des clients
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getClients } from "@/lib/supabase/client";
import { deleteClient } from "@/lib/supabase/client";
import type { Client, PaginatedClients } from "@/types/clients";

// Teintes dérivées de l'identité Lezarts Digital (magenta / violet signal)
// + quelques teintes complémentaires désaturées pour garder les secteurs
// lisibles sans retomber sur la palette Tailwind par défaut.
const SECTOR_COLORS: Record<string, string> = {
  "E-commerce": "bg-[#6C4CFF]/10 text-[#6C4CFF]",
  Immobilier: "bg-[#2D6FF2]/10 text-[#2D6FF2]",
  Restauration: "bg-[#E8823C]/10 text-[#B85F1F]",
  "Mode & Beauté": "bg-[#FF3D7F]/10 text-[#FF3D7F]",
  "Tech & SaaS": "bg-[#2BB7C4]/10 text-[#1A8A95]",
  "Santé & Bien-être": "bg-[#3FAE6B]/10 text-[#2E8253]",
  Finance: "bg-[#1A1720]/10 text-[#1A1720]",
  Éducation: "bg-[#D6A32C]/10 text-[#95721B]",
  Tourisme: "bg-[#3E9BD6]/10 text-[#2A749F]",
  Sport: "bg-[#8CC63F]/10 text-[#5E8B24]",
  Autre: "bg-[#9C96B5]/15 text-[#6B6579]",
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
    "bg-[#6C4CFF]/10 text-[#6C4CFF]",
    "bg-[#2D6FF2]/10 text-[#2D6FF2]",
    "bg-[#2BB7C4]/10 text-[#1A8A95]",
    "bg-[#FF3D7F]/10 text-[#FF3D7F]",
    "bg-[#D6A32C]/10 text-[#95721B]",
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
    <div className="space-y-6 p-6 max-w-6xl mx-auto font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
            Clients
          </h1>
          {result && (
            <p className="mt-0.5 text-sm text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
              {result.total} client{result.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Link
          href="/dashboard/clients/addClient"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF3D7F] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02f6c] transition-colors"
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
          className="flex-1 rounded-lg border border-[#1A1720]/10 bg-white px-3 py-2 text-sm text-[#1A1720] outline-none focus:border-[#FF3D7F] focus:ring-2 focus:ring-[#FF3D7F]/15"
        />
        <button
          type="submit"
          className="rounded-lg border border-[#1A1720]/10 px-4 py-2 text-sm font-medium text-[#6B6579] hover:bg-[#1A1720]/5 transition-colors"
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
            className="rounded-lg border border-[#1A1720]/10 px-3 py-2 text-sm text-[#9C96B5] hover:text-[#1A1720]"
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
          <p className="text-[#9C96B5] text-sm">
            {search
              ? `Aucun résultat pour « ${search} »`
              : "Aucun client pour le moment."}
          </p>
          {!search && (
            <Link
              href="/dashboard/clients/addClient"
              className="mt-3 inline-block text-sm font-medium text-[#FF3D7F] hover:underline"
            >
              Créer votre premier client →
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1A1720]/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A1720]/10 bg-[#F4F5F1] text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
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
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  Statut
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
                <th className="px-4 py-3 text-right">Connexion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1720]/5">
              {result?.data.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-[#F4F5F1]/60 transition-colors"
                >
                  {/* Nom + initiales */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-[Space_Grotesk,sans-serif] font-semibold ${getAvatarColor(
                          client.nom
                        )}`}
                      >
                        {getInitials(client.nom)}
                      </div>
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-medium text-[#1A1720] hover:text-[#FF3D7F] transition-colors"
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
                          "bg-[#1A1720]/5 text-[#6B6579]"
                        }`}
                      >
                        {client.secteur}
                      </span>
                    ) : (
                      <span className="text-[#D9D5E0]">—</span>
                    )}
                  </td>

                  {/* Ton */}
                  <td className="hidden px-4 py-3 text-[#6B6579] capitalize md:table-cell">
                    {client.ton ?? <span className="text-[#D9D5E0]">—</span>}
                  </td>

                  {/* Nb exemples */}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-[#9C96B5] text-xs font-[IBM_Plex_Mono,monospace]">
                      {client.exemples?.length ?? 0} exemple
                      {(client.exemples?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {client.collaborateurs?.profiles ? (
                      <span className="text-[#1A1720]">
                        {client.collaborateurs.profiles.nom}{" "}
                        {client.collaborateurs.profiles.prenom}
                      </span>
                    ) : (
                      <span className="text-[#FF3D7F]">Pas encore affecté</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-[#6B6579] capitalize md:table-cell">
                    {client.statut ?? <span className="text-[#D9D5E0]">—</span>}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="rounded-md px-2.5 py-1 text-xs text-[#6B6579] hover:bg-[#1A1720]/5 transition-colors"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/dashboard/clients/${client.id}?edit=1`}
                        className="rounded-md px-2.5 py-1 text-xs text-[#6C4CFF] hover:bg-[#6C4CFF]/10 transition-colors"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(client)}
                        disabled={deletingId === client.id}
                        className="rounded-md px-2.5 py-1 text-xs text-[#9C96B5] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        {deletingId === client.id ? "…" : "Supprimer"}
                      </button>
                    </div>
                  </td>
                  <td>
                  <a
                        href={`/api/auth/meta?clientId=${client.id}`}
                        className="rounded-md border border-[#1A1720]/10 px-2.5 py-1 text-xs font-[IBM_Plex_Mono,monospace] text-[#6B6579] hover:border-[#2D6FF2]/40 hover:text-[#2D6FF2] transition-colors"
                      >
                        Meta
                      </a>
                      <a
                        href={`/api/auth/google?clientId=${client.id}`}
                        className="rounded-md border border-[#1A1720]/10 px-2.5 py-1 text-xs font-[IBM_Plex_Mono,monospace] text-[#6B6579] hover:border-[#D6A32C]/50 hover:text-[#95721B] transition-colors"
                      >
                        Google
                      </a>
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
          <p className="text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
            Page {result.page} / {result.total_pages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#1A1720]/10 px-3 py-1.5 text-[#6B6579] hover:bg-[#1A1720]/5 disabled:opacity-40 transition-colors"
            >
              ← Précédent
            </button>
            <button
              disabled={page === result.total_pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#1A1720]/10 px-3 py-1.5 text-[#6B6579] hover:bg-[#1A1720]/5 disabled:opacity-40 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}