"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getContents } from "@/lib/supabase/contents";
import { getClients } from "@/lib/supabase/client";

export default function ContentsPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadContents(clientId = "") {
    setLoading(true);

    try {
      const result = await getContents(1, 20, clientId || undefined);

      setContents(result.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContents();

    getClients(1, 100).then((res) => {
      setClients(res.data);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Contenus récents</h1>
          <p className="text-sm text-gray-500">Tous les contenus générés</p>
        </div>

        <Link
          href="/dashboard/generate/addContent"
          className="rounded-lg bg-[#FF3D7F] px-4 py-2 text-white hover:bg-[#e12d6c]"
        >
          + Générer contenu
        </Link>
      </div>

      {/* Filtre */}
      <div className="flex gap-3">
        <select
          value={selectedClient}
          onChange={(e) => {
            const value = e.target.value;

            setSelectedClient(value);
            loadContents(value);
          }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Tous les clients</option>

          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F4F5F1] border-b">
              <th className="text-left p-3">Client</th>

              <th className="text-left p-3">Plateforme</th>

              <th className="text-left p-3">Statut</th>

              <th className="text-left p-3">Date</th>

              <th className="text-left p-3">Aperçu</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  Chargement...
                </td>
              </tr>
            ) : contents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  Aucun contenu trouvé
                </td>
              </tr>
            ) : (
              contents.map((content) => (
                <Link
                  href={`/dashboard/generate/${content.id}`}
                  key={content.id}
                  className="contents"
                >
                  <tr className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="p-3">{content.clients?.nom}</td>

                    <td className="p-3">{content.plateforme}</td>

                    <td className="p-3">{content.statut}</td>

                    <td className="p-3">
                      {new Date(content.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-3 max-w-md">
                      <div className="truncate">{content.texte}</div>
                    </td>
                  </tr>
                </Link>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
