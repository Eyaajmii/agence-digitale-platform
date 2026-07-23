"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getCollaborateurs,
  deleteCollaborateur,
} from "@/lib/supabase/collaborateur";
import { Collaborateur, PaginatedCollab } from "@/types/users";

function getInitials(nom: string, prenom: string) {
  return `${nom?.[0] ?? ""}${prenom?.[0] ?? ""}`.toUpperCase();
}

export default function CollaborateursPage() {
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [result, setResult] = useState<PaginatedCollab | null>(null);
  const [collabToDelete, setCollabToDelete] = useState<Collaborateur | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const loadCollaborateurs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCollaborateurs(page, 10, search);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCollaborateurs();
  }, [loadCollaborateurs]);
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }
  async function confirmDelete() {
    if (!collabToDelete) return;

    setIsDeleting(true);

    try {
      await deleteCollaborateur(collabToDelete.id);
      await loadCollaborateurs();
      setCollabToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
            La liste des collaborateurs
          </h1>
          {result && (
            <p className="mt-0.5 text-sm text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
              {result.total} collaborateurs{result.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
  
        <Link
          href="/dashboard/collaborateurs/addCollab"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
          + Nouveau collaborateur
        </Link>
      </div>
      {/* Recherche */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher un collaborateur"
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
      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF3D7F] border-t-transparent" />
        </div>
      ) : result?.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1A1720]/15 py-20 text-center">
          <p className="text-[#9C96B5] text-sm">
            Aucun collaborateur pour le moment.
          </p>
          <Link
            href="/dashboard/collaborateurs/addCollab"
            className="mt-3 inline-block text-sm font-medium text-[#FF3D7F] hover:underline"
          >
            Créer votre premier collaborateur →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {result?.data.map((collab) => (
            <div key={collab.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-semibold">
                    {getInitials(collab.profiles.nom,collab.profiles.prenom)}
                  </div>
                  <div>
                    <Link
                      href={`/dashboard/collaborateurs/${collab.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-blue-600"
                    >
                      {collab.profiles.nom} {collab.profiles.prenom}
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {collab.profiles.email || (
                        <span className="text-[#D9D5E0]">—</span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/collaborateurs/${collab.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    Voir
                  </Link>
                  <Link
                        href={`/dashboard/collaborateurs/${collab.id}?edit=1`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 ">
                        Modifier
                  </Link>
                  <button
                        onClick={() => setCollabToDelete(collab)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                      >
                        Supprimer
                      </button>
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
      {collabToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <span className="text-xl">⚠️</span>
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

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Voulez-vous vraiment supprimer :
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {collabToDelete.profiles.nom} {collabToDelete.profiles.prenom}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setCollabToDelete(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
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