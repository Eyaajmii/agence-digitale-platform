import { supabaseAdmin as supabase } from "@/lib/supabase/server";
//import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
/*const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});*/

const PLATFORM_CONSTRAINTS: Record<
  string,
  { maxChars: number; style: string }
> = {
  Twitter: {
    maxChars: 280,
    style: "accrocheur, direct, avec hashtags pertinents",
  },
  Instagram: {
    maxChars: 2200,
    style: "engageant, émotionnel, avec emojis et hashtags",
  },
  Facebook: {
    maxChars: 500,
    style: "conversationnel, informatif, call-to-action clair",
  },
  Linkedin: {
    maxChars: 3000,
    style: "professionnel, inspirant, orienté valeur business",
  },
  GoogleAds: {
    maxChars: 90,
    style: "percutant, orienté conversion, mots-clés SEO",
  },
  TikTok: {
    maxChars: 4000,
    style: "court, engageant, orienté vidéo, avec hashtags pertinents",
  },
};

export async function POST(req: NextRequest) {
  // ── 1. Parse & validate body ──────────────────────────────
  let body: { clientId: string; platform: string; objective: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { clientId, platform, objective } = body;
  if (!clientId || !platform || !objective) {
    return new Response(
      "Missing required fields: clientId, platform, objective",
      { status: 400 }
    );
  }

  const platformConfig = PLATFORM_CONSTRAINTS[platform];
  if (!platformConfig) {
    return new Response(
      `Unsupported platform. Supported: ${Object.keys(
        PLATFORM_CONSTRAINTS
      ).join(", ")}`,
      { status: 400 }
    );
  }

  // ── 2. Fetch client profile ────────────────────────────────
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("nom, secteur, ton, mots_interdits, exemples")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return new Response("Client not found", { status: 404 });
  }

  // ── 3. Fetch few-shot examples ─────────────────────────────
  const { data: validatedContents } = await supabase
    .from("contenus")
    .select("plateforme, texte")
    .eq("client_id", clientId)
    .eq("statut", "Apprové")
    .eq("plateforme", platform)
    .limit(3);

  const fewShotExamples =
    validatedContents && validatedContents.length > 0
      ? `\n\nEXEMPLES VALIDÉS PAR LE CLIENT (utilise ces exemples comme référence de ton et style) :\n${validatedContents
          .map((c, i) => `Exemple ${i + 1} :\n${c.texte}`)
          .join("\n\n")}`
      : "";

  const motsCles = Array.isArray(client.mots_interdits)
    ? client.mots_interdits.join(", ")
    : client.mots_interdits || "aucun";

  // ── 4. Build system prompt ─────────────────────────────────
  const systemPrompt = `Tu es un expert en copywriting digital spécialisé dans la création de copies publicitaires performantes.

PROFIL CLIENT :
- Nom : ${client.nom}
- Secteur : ${client.secteur}
- Ton souhaité : ${client.ton}
- Mots/expressions INTERDITS : ${motsCles}

CONTRAINTES PLATEFORME (${platform.toUpperCase()}) :
- Longueur maximale : ${platformConfig.maxChars} caractères par variante
- Style : ${platformConfig.style}
${fewShotExamples}

RÈGLES ABSOLUES :
1. Génère EXACTEMENT 3 variantes numérotées (VARIANTE 1, VARIANTE 2, VARIANTE 3)
2. Chaque variante doit respecter la limite de ${
    platformConfig.maxChars
  } caractères
3. N'utilise JAMAIS les mots interdits listés ci-dessus
4. Adapte chaque variante au ton "${client.ton}" du client
5. Chaque variante doit avoir une approche différente (ex: émotionnel, rationnel, humour)
6. Formate ta réponse exactement comme suit :

VARIANTE 1 :
[texte de la variante 1]

VARIANTE 2 :
[texte de la variante 2]

VARIANTE 3 :
[texte de la variante 3]`;

  const userPrompt = `Génère 3 variantes de copy publicitaire pour ${client.nom} sur ${platform}.

Objectif de la campagne : ${objective}

Rappel : respecte strictement le profil client, les contraintes de la plateforme et génère 3 variantes distinctes.`;
  // ── 5. SSE ReadableStream ──────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        sendEvent("start", {
          message: "Génération démarrée",
          platform,
          clientId,
        });
        /**
         * const claudeStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        });
         */
        const stream = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile", // gratuit et très fort
          max_tokens: 1500,
          temperature:0.8,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          stream: true,
        });
        let fullText = "";
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            fullText += text;
            sendEvent("delta", { text });
          }
        }

        //let fullText = "";

        /*claudeStream.on("text", (text) => {
          fullText += text;
          sendEvent("delta", { text });
        });*/

        //const finalMessage = await claudeStream.finalMessage();

        const variants = parseVariants(fullText);

        //if (variants.length > 0) {
          /*const { data: savedContent, error: saveError } = await supabase
            .from("contenus")
            .insert({
              client_id: clientId,
              plateforme: platform,
              statut: "Brouillon",
              texte: variants[0] ?? fullText,
              variantes: variants,
            })
            .select("id")
            .single();

          if (saveError) {
            console.error("Error saving content:", saveError);
          }*/

          sendEvent("complete", {
            variants,
            //contentId: savedContent?.id ?? null,
            //usage: finalMessage.usage,
            //model: finalMessage.model,
            contentId: null,
            model: "llama-3.3-70b-versatile",
          });
        /*} else {
          sendEvent("complete", {
            variants: [fullText],
            contentId: null,
            //usage: finalMessage.usage,
            //model: finalMessage.model,
            model: "llama-3.3-70b-versatile",
          });
        }*/
      } catch (error: unknown) {
        console.error("Streaming error:", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        sendEvent("error", { message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const clientId = searchParams.get("clientId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("contenus")
      .select(
        `
        *,
        clients (
          id,
          nom
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur récupération contenus" },
      { status: 500 }
    );
  }
}
// ── Helper: parse variants ─────────────────────────────────
function parseVariants(text: string): string[] {
  const variants: string[] = [];

  const regex = /VARIANTE\s+\d+\s*:\s*([\s\S]*?)(?=VARIANTE\s+\d+\s*:|$)/gi;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const content = match[1].trim();
    if (content) variants.push(content);
  }

  if (variants.length === 0 && text.trim()) {
    return [text.trim()];
  }

  return variants;
}
