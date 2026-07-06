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
    "bg-[#6C4CFF]/10 text-[#6C4CFF]",
    "bg-[#2D6FF2]/10 text-[#2D6FF2]",
    "bg-[#2BB7C4]/10 text-[#1A8A95]",
    "bg-[#FF3D7F]/10 text-[#FF3D7F]",
    "bg-[#D6A32C]/10 text-[#95721B]",
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
    <div className="space-y-6 p-6 max-w-6xl mx-auto font-[Inter,sans-serif]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
            Collaborateurs
          </h1>
  
          <p className="mt-0.5 text-sm text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
            {collaborateurs.length} collaborateur
            {collaborateurs.length !== 1 ? "s" : ""}
          </p>
        </div>
  
        <Link
          href="/dashboard/collaborateurs/addCollab"
          className="inline-flex items-center gap-2 rounded-lg bg-[#FF3D7F] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02f6c] transition-colors"
        >
          + Nouveau collaborateur
        </Link>
      </div>
  
      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF3D7F] border-t-transparent" />
        </div>
      ) : collaborateurs.length === 0 ? (
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
        <div className="overflow-hidden rounded-xl border border-[#1A1720]/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A1720]/10 bg-[#F4F5F1] text-[10px] font-medium uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
                <th className="px-4 py-3 text-left">Collaborateur</th>
                <th className="px-4 py-3 text-left">Téléphone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Date création</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
  
            <tbody className="divide-y divide-[#1A1720]/5">
              {collaborateurs.map((collab) => {
                const profile = collab.profiles;
  
                return (
                  <tr
                    key={collab.id}
                    className="hover:bg-[#F4F5F1]/60 transition-colors"
                  >
                    {/* Collaborateur */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-[Space_Grotesk,sans-serif] font-semibold ${getAvatarColor(
                            profile.nom
                          )}`}
                        >
                          {getInitials(profile.nom, profile.prenom)}
                        </div>
  
                        <Link
                          href={`/dashboard/collaborateurs/${collab.id}`}
                          className="font-medium text-[#1A1720] hover:text-[#FF3D7F] transition-colors"
                        >
                          {profile.nom} {profile.prenom}
                        </Link>
                      </div>
                    </td>
  
                    {/* Téléphone */}
                    <td className="px-4 py-3 text-[#6B6579]">
                      {profile.telephone || (
                        <span className="text-[#D9D5E0]">—</span>
                      )}
                    </td>
  
                    {/* Email */}
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#6C4CFF]/10 px-2.5 py-0.5 text-xs font-medium text-[#6C4CFF]">
                        {profile.email}
                      </span>
                    </td>
  
                    {/* Date */}
                    <td className="px-4 py-3 text-[#6B6579]">
                      {new Date(profile.created_at).toLocaleDateString("fr-FR")}
                    </td>
  
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/collaborateurs/${collab.id}`}
                          className="rounded-md px-2.5 py-1 text-xs text-[#6B6579] hover:bg-[#1A1720]/5 transition-colors"
                        >
                          Voir
                        </Link>
  
                        <Link
                          href={`/dashboard/collaborateurs/${collab.id}?edit=1`}
                          className="rounded-md px-2.5 py-1 text-xs text-[#6C4CFF] hover:bg-[#6C4CFF]/10 transition-colors"
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
                          className="rounded-md px-2.5 py-1 text-xs text-[#9C96B5] hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
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