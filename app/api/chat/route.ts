// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, clientId } = await request.json();

    if (!messages || !clientId) {
      return NextResponse.json(
        { error: "messages et clientId sont requis" },
        { status: 400 }
      );
    }

    // 1. Récupération du profil client (RAG contexte)
    const { data: client } = await supabase
      .from("clients")
      .select("nom, secteur, ton, mots_interdits, exemples")
      .eq("id", clientId)
      .single();

    // 2. Récupération des derniers KPI snapshots (RAG données)
    const { data: snapshots } = await supabase
      .from("kpi_snapshots")
      .select("source, data, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 3. Récupération des derniers contenus publiés (RAG contenu)
    const { data: contenus } = await supabase
      .from("contenus")
      .select("plateforme, texte, statut, created_at")
      .eq("client_id", clientId)
      .eq("statut", "publie")
      .order("created_at", { ascending: false })
      .limit(10);

    // 4. Construction du system prompt RAG
    const systemPrompt = `Tu es l'assistant IA interne de l'agence digitale AgenceAI.
Tu es connecté en temps réel aux données du client ${client?.nom || "inconnu"}.

## Profil client
- Nom : ${client?.nom || "N/A"}
- Secteur : ${client?.secteur || "N/A"}
- Ton de communication : ${client?.ton || "N/A"}
- Mots interdits : ${client?.mots_interdits || "aucun"}

## KPIs récents (données live)
${
  snapshots && snapshots.length > 0
    ? snapshots
        .map(
          (s) =>
            `### Source : ${s.source}\n${JSON.stringify(s.data, null, 2)}`
        )
        .join("\n\n")
    : "Aucune donnée KPI disponible."
}

## Contenus publiés récents (${contenus?.length || 0} contenus)
${
  contenus && contenus.length > 0
    ? contenus
        .map(
          (c) =>
            `[${c.plateforme}] ${c.texte?.substring(0, 150)}${
              c.texte?.length > 150 ? "..." : ""
            }`
        )
        .join("\n")
    : "Aucun contenu publié récent."
}

## Instructions
- Réponds toujours en français, de façon concise et actionnelle.
- Appuie tes réponses sur les données ci-dessus quand c'est pertinent.
- Si tu cites un KPI, précise la source (Meta, Google, GA4...).
- Tu peux proposer des recommandations, générer du contenu, ou analyser des performances.
- Cite les sources de données utilisées à la fin de chaque réponse avec des badges courts ex: [kpi_snapshots · meta] [contenus · instagram].`;

    // 5. Stream de la réponse Claude
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // 6. Retour en SSE (Server-Sent Events)
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}