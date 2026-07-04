//crawler cheerio
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createClient } from '@supabase/supabase-js';
import type { AeoDetailsScore, AeoRecommendation } from "@/types/aeo";
import { callClaudeJSON } from "@/lib/claude/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

interface AuditRequestBody {
  clientId: string;
  url: string;
}

interface ExtractedContent {
  headings: { tag: string; text: string }[];
  paragraphCount: number;
  hasFaqSchema: boolean;
  internalLinks: number;
  externalLinks: number;
  namedEntities: string[]; // heuristique simple, affinée par Claude ensuite
  wordCount: number;
  textSample: string;
}

interface ClaudeScoringResponse {
  score_aeo: number;
  details_score: AeoDetailsScore;
  recommandations: AeoRecommendation[];
}
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
/**
 * Extraction "cheerio" du contenu de la page : structure Hn, paragraphes,
 * présence d'un schema.org FAQPage, densité de liens, échantillon de texte
 * pour le prompt de scoring.
 */
function extractContent(html: string, pageUrl: string): ExtractedContent {
  const $ = cheerio.load(html);
  const origin = new URL(pageUrl).origin;

  const headings = $("h1, h2, h3, h4, h5, h6")
    .map((_, el) => ({
      tag: (el as any).name.toLowerCase(),
      text: $(el).text().trim(),
    }))
    .get()
    .filter((h) => h.text.length > 0);

  const paragraphs = $("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 0);

  const hasFaqSchema = $('script[type="application/ld+json"]')
    .map((_, el) => $(el).html() || "")
    .get()
    .some((json) => {
      try {
        const parsed = JSON.parse(json);
        const types = JSON.stringify(parsed);
        return /FAQPage/i.test(types);
      } catch {
        return false;
      }
    });

  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("#") || href.startsWith("mailto:")) return;
    try {
      const resolved = new URL(href, origin);
      if (resolved.origin === origin) internalLinks++;
      else externalLinks++;
    } catch {
      // href invalide, on ignore
    }
  });

  // Heuristique légère pour repérer des entités nommées candidates
  // (mots capitalisés hors début de phrase) — le scoring fin est délégué à Claude.
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const entityMatches = bodyText.match(/\b[A-ZÀ-Ý][a-zà-ÿ]+(?:\s[A-ZÀ-Ý][a-zà-ÿ]+)*\b/g) || [];
  const namedEntities = Array.from(new Set(entityMatches)).slice(0, 40);

  return {
    headings,
    paragraphCount: paragraphs.length,
    hasFaqSchema,
    internalLinks,
    externalLinks,
    namedEntities,
    wordCount: bodyText.split(" ").filter(Boolean).length,
    textSample: bodyText.slice(0, 6000),
  };
}

async function scoreWithClaude(url: string, extracted: ExtractedContent) {
  const system = `Tu es un expert en AEO/GEO (AI Engine Optimization) : tu évalues si une page a de bonnes chances d'être citée par des moteurs IA génératifs (ChatGPT, Perplexity, Gemini, Claude).
Tu notes strictement sur les 5 critères suivants, chacun /100 :
- clarte_definitions : la page définit-elle clairement ses concepts clés en 1-2 phrases citables ?
- donnees_chiffrees : présence de statistiques, chiffres, données factuelles vérifiables ?
- structure_faq : présence d'une section FAQ ou de questions/réponses structurées (idéalement en schema.org) ?
- entites_nommees : densité d'entités nommées précises (lieux, marques, dates, noms propres) qui ancrent le contenu ?
- autorite_sources : la page cite-t-elle des sources externes crédibles (études, certifications, presse) ?
Le score_aeo global est la moyenne pondérée de ces 5 critères (tu choisis la pondération la plus pertinente).
Tu retournes aussi une liste de recommandations concrètes et actionnables, chacune classée par impact ("eleve", "moyen" ou "faible"), triées de l'impact le plus fort au plus faible.`;

  const prompt = `URL analysée : ${url}

Structure de titres détectée :
${extracted.headings.map((h) => `${h.tag.toUpperCase()}: ${h.text}`).join("\n") || "(aucun titre détecté)"}

Nombre de paragraphes : ${extracted.paragraphCount}
Nombre de mots (corps de page) : ${extracted.wordCount}
Schema.org FAQPage détecté : ${extracted.hasFaqSchema ? "oui" : "non"}
Liens internes : ${extracted.internalLinks} / Liens externes : ${extracted.externalLinks}
Entités candidates détectées : ${extracted.namedEntities.slice(0, 25).join(", ") || "(peu d'entités détectées)"}

Échantillon de texte de la page :
"""
${extracted.textSample}
"""

Retourne un JSON de la forme exacte :
{
  "score_aeo": <nombre 0-100>,
  "details_score": {
    "clarte_definitions": <0-100>,
    "donnees_chiffrees": <0-100>,
    "structure_faq": <0-100>,
    "entites_nommees": <0-100>,
    "autorite_sources": <0-100>
  },
  "recommandations": [
    { "impact": "eleve" | "moyen" | "faible", "texte": "<recommandation concrète et courte>" }
  ]
}`;

  return callClaudeJSON<ClaudeScoringResponse>({ system, prompt, maxTokens: 1500 });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AuditRequestBody;

    if (!body.clientId || !body.url) {
      return NextResponse.json(
        { error: "clientId et url sont requis." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.url);
    } catch {
      return NextResponse.json({ error: "URL invalide." }, { status: 400 });
    }

    const pageResponse = await fetch(parsedUrl.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AeoAuditBot/1.0)" },
      redirect: "follow",
    });

    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: `Impossible de récupérer la page (HTTP ${pageResponse.status}).` },
        { status: 502 }
      );
    }

    const html = await pageResponse.text();
    const extracted = extractContent(html, parsedUrl.toString());
    const scoring = await scoreWithClaude(parsedUrl.toString(), extracted);

    const { data, error } = await supabaseAdmin
      .from("audit_aeo")
      .insert({
        client_id: body.clientId,
        url: parsedUrl.toString(),
        score_aeo: scoring.score_aeo,
        details_score: scoring.details_score,
        recommandations: scoring.recommandations,
        contenu_brut: extracted.textSample,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ audit: data });
  } catch (err) {
    console.error("[/api/aeo/audit]", err);
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'audit AEO." },
      { status: 500 }
    );
  }
}

/** GET /api/aeo/audit?clientId=... — historique des audits d'un client */
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId requis." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("audit_aeo")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ audits: data });
}