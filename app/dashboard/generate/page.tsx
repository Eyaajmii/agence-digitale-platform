"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getContents } from "@/lib/supabase/contents";
import { getClients } from "@/lib/supabase/client";
import { PLATFORM_LABELS } from "@/types/content";

const PLATFORM_COLORS: Record<string, string> = {
  Twitter: "bg-[#1DA1F2]/10 text-[#1DA1F2]",
  Instagram: "bg-[#FF3D7F]/10 text-[#FF3D7F]",
  Facebook: "bg-[#1877F2]/10 text-[#1877F2]",
  Linkedin: "bg-[#0A66C2]/10 text-[#0A66C2]",
  GoogleAds: "bg-[#D6A32C]/10 text-[#95721B]",
  TikTok: "bg-[#1A1720]/10 text-[#1A1720]",
};

const STATUS_COLORS: Record<string, string> = {
  Brouillon: "bg-amber-50 text-amber-700",
  Approuvé: "bg-emerald-50 text-emerald-700",
  Publié: "bg-[#6C4CFF]/10 text-[#6C4CFF]",
};

function getInitials(name: string) {
  return name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-[#6C4CFF]/10 text-[#6C4CFF]",
    "bg-[#2D6FF2]/10 text-[#2D6FF2]",
    "bg-[#2BB7C4]/10 text-[#1A8A95]",
    "bg-[#FF3D7F]/10 text-[#FF3D7F]",
    "bg-[#D6A32C]/10 text-[#95721B]",
  ];

  return colors[(name?.charCodeAt(0) || 0) % colors.length];
}

export default function ContentsPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadContents = useCallback(
    async (clientId = selectedClient, currentPage = page) => {
      setLoading(true);

      try {
        const result = await getContents(
          currentPage,
          10,
          clientId || undefined
        );

        setContents(result.data || []);
        setTotalPages(result.total_pages || 1);
        setTotal(result.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [selectedClient, page]
  );

  useEffect(() => {
    loadContents();

    getClients(1, 100).then((res) => {
      setClients(res.data || []);
    });
  }, [loadContents]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
            Contenus générés
          </h1>

          <p className="mt-0.5 text-sm text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
            {total} contenu{total !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          href="/dashboard/generate/addContent"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF3D7F] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02f6c] transition-colors"
        >
          + Générer contenu
        </Link>
      </div>

      {/* Filtres */}
      <div className="rounded-xl border border-[#1A1720]/10 bg-white p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedClient}
            onChange={(e) => {
              const value = e.target.value;

              setSelectedClient(value);
              setPage(1);

              loadContents(value, 1);
            }}
            className="rounded-lg border border-[#1A1720]/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#FF3D7F] focus:ring-2 focus:ring-[#FF3D7F]/15"
          >
            <option value="">Tous les clients</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF3D7F] border-t-transparent" />
        </div>
      ) : contents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1A1720]/15 py-20 text-center">
          <p className="text-[#9C96B5] text-sm">
            Aucun contenu trouvé.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1A1720]/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A1720]/10 bg-[#F4F5F1] text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
                <th className="px-4 py-3 text-left">Client</th>
                <th className="px-4 py-3 text-left">Plateforme</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left">
                  Objective
                </th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="hidden md:table-cell px-4 py-3 text-left">
                  Date
                </th>
                <th className="px-4 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1A1720]/5">
              {contents.map((content) => (
                <tr
                  key={content.id}
                  className="hover:bg-[#F4F5F1]/60 transition-colors"
                >
                  {/* Client */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                          content.clients?.nom || "C"
                        )}`}
                      >
                        {getInitials(content.clients?.nom || "Client")}
                      </div>

                      <span className="font-medium text-[#1A1720]">
                        {content.clients?.nom || "Client"}
                      </span>
                    </div>
                  </td>

                  {/* Plateforme */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        PLATFORM_COLORS[content.plateforme] ||
                        "bg-[#1A1720]/5 text-[#6B6579]"
                      }`}
                    >
                      {PLATFORM_LABELS[
                        content.plateforme as keyof typeof PLATFORM_LABELS
                      ] || content.plateforme}
                    </span>
                  </td>
                  {/* Aperçu */}
                  <td className="hidden lg:table-cell px-4 py-3">
                    <div className="max-w-md truncate text-[#6B6579]">
                      {content.objective}
                    </div>
                  </td>
                  {/* Statut */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_COLORS[content.statut] ||
                        "bg-[#1A1720]/5 text-[#6B6579]"
                      }`}
                    >
                      {content.statut}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="hidden md:table-cell px-4 py-3 text-[#6B6579]">
                    {new Date(content.created_at).toLocaleDateString("fr-FR")}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/dashboard/generate/${content.id}`}
                        className="rounded-md px-2.5 py-1 text-xs text-[#6C4CFF] hover:bg-[#6C4CFF]/10 transition-colors"
                      >
                        Voir
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
            Page {page} / {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => {
                const p = page - 1;
                setPage(p);
                loadContents(selectedClient, p);
              }}
              className="rounded-lg border border-[#1A1720]/10 px-3 py-1.5 text-[#6B6579] hover:bg-[#1A1720]/5 disabled:opacity-40 transition-colors"
            >
              ← Précédent
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => {
                const p = page + 1;
                setPage(p);
                loadContents(selectedClient, p);
              }}
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
