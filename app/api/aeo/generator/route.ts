import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { streamClaude } from "@/lib/claude/prompts";
import type { GenerateAeoContentInput } from "@/types/aeo";

export const runtime = "nodejs";
export const maxDuration = 60;
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
function buildSystemPrompt(client: {
  nom: string;
  secteur: string;
  ton: string;
  mots_interdits: string | null;
}) {
  return `Tu es rédacteur spécialisé en AEO/GEO (AI Engine Optimization) pour l'agence digitale qui gère le client "${client.nom}" (secteur : ${client.secteur}).
Ton éditorial du client à respecter strictement : ${client.ton}.
${client.mots_interdits ? `Mots/expressions interdits : ${client.mots_interdits}.` : ""}

Ta mission : rédiger un article structuré pour maximiser les chances d'être cité par des moteurs IA génératifs (ChatGPT, Perplexity, Gemini, Claude). Respecte impérativement cette structure :
1. Une définition explicite du sujet en 2 phrases maximum, citable telle quelle.
2. Des sections titrées avec des balises H2/H3 claires (écris les titres en Markdown ##, ###).
3. Un encadré FAQ en fin d'article avec au moins 5 questions/réponses courtes (précédé de "## FAQ").
4. Des données factuelles chiffrées, en indiquant leur source entre parenthèses.
5. Des entités nommées explicites (lieux, marques, dates précises) plutôt que des tournures vagues.

Réponds uniquement avec l'article en Markdown, sans commentaire ni préambule.`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GenerateAeoContentInput;

  if (!body.clientId || !body.sujet || !body.publicCible) {
    return NextResponse.json(
      { error: "clientId, sujet et publicCible sont requis." },
      { status: 400 }
    );
  }

  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("nom, secteur, ton, mots_interdits")
    .eq("id", body.clientId)
    .single();

  if (error || !client) {
    return NextResponse.json(
      { error: "Client introuvable." },
      { status: 404 }
    );
  }

  const system = buildSystemPrompt(client);
  const prompt = `Sujet : ${body.sujet}
Angle éditorial souhaité : ${body.angle || "(libre, au meilleur jugement)"}
Public cible : ${body.publicCible}`;

  const claudeStream = await streamClaude({ system, prompt, maxTokens: 3000 });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      claudeStream.on("text", (chunk: string) => {
        controller.enqueue(encoder.encode(chunk));
      });
      claudeStream.on("end", () => controller.close());
      claudeStream.on("error", (err: unknown) => {
        console.error("[/api/aeo/generate] stream error", err);
        controller.error(err);
      });
    },
    cancel() {
      claudeStream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}