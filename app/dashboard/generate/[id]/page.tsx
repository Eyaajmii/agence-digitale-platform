"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContentById } from "@/lib/supabase/contents";

export default function ContentDetailPage() {
  const { id } = useParams();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getContentById(id as string);
        setContent(data);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Chargement...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-10 text-center text-red-500">
        Contenu introuvable
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          {content.clients?.nom}
        </h1>
        <p className="text-gray-500">
          {content.plateforme} • {content.statut}
        </p>
      </div>

      {/* Meta */}
      <div className="text-sm text-gray-500">
        Créé le{" "}
        {new Date(content.created_at).toLocaleString()}
      </div>

      {/* Texte principal */}
      <div className="bg-white border rounded-xl p-5 whitespace-pre-wrap">
        {content.texte}
      </div>

      {/* Variantes si existent */}
      {content.variantes?.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">
            Variantes
          </h2>

          {content.variantes.map(
            (v: string, i: number) => (
              <div
                key={i}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <span className="font-medium">
                  Variante {i + 1}
                </span>
                <p className="whitespace-pre-wrap mt-2">
                  {v}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}