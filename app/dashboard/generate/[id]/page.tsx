"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContentById } from "@/lib/supabase/contents";
function PlatformBadge({ plateforme }: { plateforme: string }) {
  const styles: Record<string, string> = {
    Twitter: "bg-black/10 text-black",
    Instagram: "bg-pink-50 text-pink-600",
    Facebook: "bg-blue-50 text-blue-600",
    Linkedin: "bg-sky-50 text-sky-700",
    GoogleAds: "bg-amber-50 text-amber-700",
    TikTok: "bg-[#1A1720]/10 text-[#1A1720]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${
        styles[plateforme] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {plateforme}
    </span>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const styles: Record<string, string> = {
    Brouillon: "bg-amber-50 text-amber-700",
    Approuvé: "bg-emerald-50 text-emerald-700",
    Publié: "bg-[#6C4CFF]/10 text-[#6C4CFF]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${
        styles[statut] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statut}
    </span>
  );
}

function getVariantStyle(index: number) {
  const variants = [
    {
      border: "border-[#6C4CFF]/20",
      bg: "bg-[#6C4CFF]/5",
      badge: "bg-[#6C4CFF]/10 text-[#6C4CFF]",
    },
    {
      border: "border-[#FF3D7F]/20",
      bg: "bg-[#FF3D7F]/5",
      badge: "bg-[#FF3D7F]/10 text-[#FF3D7F]",
    },
    {
      border: "border-[#2D6FF2]/20",
      bg: "bg-[#2D6FF2]/5",
      badge: "bg-[#2D6FF2]/10 text-[#2D6FF2]",
    },
  ];

  return variants[index % variants.length];
}
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
    return <div className="p-10 text-center">Chargement...</div>;
  }

  if (!content) {
    return (
      <div className="p-10 text-center text-red-500">Contenu introuvable</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-[Space_Grotesk,sans-serif] text-[#1A1720]">
              {content.clients?.nom}
            </h1>

            <p className="mt-2 text-sm text-[#6B6579]">
              Objectif : {content.objective}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <PlatformBadge plateforme={content.plateforme} />
            <StatusBadge statut={content.statut} />
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#1A1720]/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
            Client
          </p>

          <p className="mt-2 text-sm font-medium text-[#1A1720]">
            {content.clients?.nom}
          </p>
        </div>

        <div className="rounded-xl border border-[#1A1720]/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
            Plateforme
          </p>

          <div className="mt-2">
            <PlatformBadge plateforme={content.plateforme} />
          </div>
        </div>

        <div className="rounded-xl border border-[#1A1720]/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
            Créé le
          </p>

          <p className="mt-2 text-sm font-medium text-[#1A1720]">
            {new Date(content.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      {/*<div className="overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-white">
        <div className="border-b border-[#1A1720]/10 bg-[#F4F5F1] px-6 py-4">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#9C96B5] font-medium font-[IBM_Plex_Mono,monospace]">
            Contenu principal
          </h2>
        </div>

        <div className="p-6">
          <p className="whitespace-pre-wrap leading-relaxed text-[#1A1720]">
            {content.texte}
          </p>
        </div>
      </div>*/}

      {content.variantes?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#9C96B5] font-medium font-[IBM_Plex_Mono,monospace]">
            Variantes générées
          </h2>

          {content.variantes.map((variant: string, index: number) => {
            const isApproved = variant.trim() === content.texte?.trim();

            return (
              <div
                key={index}
                className={`rounded-xl border p-5 transition-all ${
                  isApproved
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-[#1A1720]/10 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-[#1A1720]">
                    Variante {index + 1}
                  </span>

                  {isApproved && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      Approuvée
                    </span>
                  )}
                </div>

                <p className="whitespace-pre-wrap text-[#1A1720]">{variant}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
