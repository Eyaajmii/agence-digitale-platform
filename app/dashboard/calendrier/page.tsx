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
    <div className="space-y-6 p-6 max-w-6xl mx-auto font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
            Liste des contenus générés
          </h1>

          <p className="mt-0.5 text-sm text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
            {total} contenu{total !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          href="/dashboard/generate/addContent"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
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
        <div className="grid gap-4">
  {contents.map((content) => (
    <div
      key={content.id}
      className="
      bg-white
      border
      border-slate-200
      rounded-2xl
      p-5
      shadow-sm
      hover:shadow-md
      transition-all
      "
    >
      <div className="flex items-start justify-between gap-4">
        {/* Partie gauche */}
        <div className="flex items-center gap-4">
         
            {getInitials(content.clients?.nom || "Client")}

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {content.clients?.nom || "Client"}
            </h3>

            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  PLATFORM_COLORS[content.plateforme] ||
                  "bg-slate-100 text-slate-600"
                }`}
              >
                {PLATFORM_LABELS[
                  content.plateforme as keyof typeof PLATFORM_LABELS
                ] || content.plateforme}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  STATUS_COLORS[content.statut] ||
                  "bg-slate-100 text-slate-600"
                }`}
              >
                {content.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/dashboard/generate/${content.id}`}
          className="
          rounded-lg
          border
          border-slate-200
          px-3
          py-2
          text-sm
          hover:bg-slate-50
          "
        >
          Voir
        </Link>
      </div>

      {/* Infos */}
      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Objectif
          </p>

          <p className="mt-1 text-sm text-slate-700 line-clamp-3">
            {content.objective || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Date de création
          </p>

          <p className="mt-1 text-sm text-slate-700">
            {new Date(content.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  ))}
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
