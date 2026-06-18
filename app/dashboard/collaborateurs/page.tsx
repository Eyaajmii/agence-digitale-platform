"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getCollaborateurs,
  deleteCollaborateur,
} from "@/lib/supabase/collaborateur";

function getInitials(nom: string, prenom: string) {
  return `${nom?.[0] ?? ""}${prenom?.[0] ?? ""}`.toUpperCase();
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

export default function CollaborateursPage() {
  const [collaborateurs, setCollaborateurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCollaborateurs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollaborateurs();
      setCollaborateurs(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollaborateurs();
  }, [loadCollaborateurs]);

  async function handleDelete(id: string, nom: string, prenom: string) {
    const confirmDelete = confirm(
      `Supprimer ${nom} ${prenom} ? Cette action est irréversible.`
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await deleteCollaborateur(id);
      await loadCollaborateurs();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Collaborateurs
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {collaborateurs.length} collaborateur
            {collaborateurs.length > 1 ? "s" : ""}
          </p>
        </div>

        <Link
          href="/dashboard/collaborateurs/addCollab"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          + Nouveau collaborateur
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        </div>
      ) : collaborateurs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-20 text-center">
          <p className="text-sm text-zinc-400">
            Aucun collaborateur pour le moment.
          </p>

          <Link
            href="/dashboard/collaborateurs/addCollab"
            className="mt-3 inline-block text-sm font-medium text-violet-600 hover:underline"
          >
            Créer votre premier collaborateur →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-3 text-left">Collaborateur</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Date création</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {collaborateurs.map((collab) => {
                const profile = collab.profiles;

                return (
                  <tr
                    key={collab.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    {/* Nom */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(
                            profile.nom
                          )}`}
                        >
                          {getInitials(profile.nom, profile.prenom)}
                        </div>

                        <div>
                          <p className="font-medium text-zinc-900">
                            {profile.nom} {profile.prenom}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Téléphone */}
                    <td className="px-4 py-3 text-zinc-600">
                      {profile.telephone || (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                        {profile.email}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(profile.created_at).toLocaleDateString(
                        "fr-FR"
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/collaborateurs/${collab.id}`}
                          className="rounded-md px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors"
                        >
                          Voir
                        </Link>

                        <Link
                          href={`/dashboard/collaborateurs/${collab.id}?edit=1`}
                          className="rounded-md px-2.5 py-1 text-xs text-violet-600 hover:bg-violet-50 transition-colors"
                        >
                          Modifier
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(
                              collab.id,
                              profile.nom,
                              profile.prenom
                            )
                          }
                          disabled={deletingId === collab.id}
                          className="rounded-md px-2.5 py-1 text-xs text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                        >
                          {deletingId === collab.id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}