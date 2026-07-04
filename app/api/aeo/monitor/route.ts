//Monitoring Perplexity
import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import type { MoteurIA, StatutCitation } from "@/types/aeo";

export const runtime = "nodejs";
export const maxDuration = 60;
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
interface MonitorRequestBody {
  clientId: string;
  domaineCible: string;
  requetes: string[];
  moteurs?: MoteurIA[]; // par défaut: ["perplexity"]
}

interface PerplexityCitationCheck {
  domaine_cite: boolean;
  position: number | null;
  sources: string[];
}

/**
 * Interroge l'API Perplexity ("sonar" avec recherche web) pour une requête
 * donnée et vérifie si `domaineCible` apparaît dans les citations retournées.
 */
async function checkPerplexityCitation(
  requete: string,
  domaineCible: string
): Promise<PerplexityCitationCheck> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: requete }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API a répondu ${response.status}`);
  }

  const data = await response.json();
  // L'API Perplexity retourne les sources dans `citations` (liste d'URLs).
  const citations: string[] = data.citations || [];
  const normalizedTarget = domaineCible.replace(/^https?:\/\//, "").replace(/^www\./, "");

  const index = citations.findIndex((url) =>
    url.replace(/^https?:\/\//, "").replace(/^www\./, "").includes(normalizedTarget)
  );

  return {
    domaine_cite: index !== -1,
    position: index !== -1 ? index + 1 : null,
    sources: citations,
  };
}

function computeStatut(check: PerplexityCitationCheck): StatutCitation {
  if (!check.domaine_cite) return "non_cite";
  return check.position === 1 ? "cite" : "position";
}

function computeEvolution(
  previousStatut: StatutCitation | null,
  previousPosition: number | null,
  current: PerplexityCitationCheck
): string {
  if (previousStatut === null) return "Nouveau";
  if (previousStatut !== "non_cite" && !current.domaine_cite) return "Sorti";
  if (previousStatut === "non_cite" && current.domaine_cite) return "Entré";
  if (
    previousPosition !== null &&
    current.position !== null &&
    previousPosition !== current.position
  ) {
    const delta = previousPosition - current.position;
    return delta > 0 ? `+${delta} pos.` : `${delta} pos.`;
  }
  return "stable";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MonitorRequestBody;
    const moteurs = body.moteurs?.length ? body.moteurs : (["perplexity"] as MoteurIA[]);

    if (!body.clientId || !body.domaineCible || !body.requetes?.length) {
      return NextResponse.json(
        { error: "clientId, domaineCible et requetes sont requis." },
        { status: 400 }
      );
    }

    const results = [];

    for (const requete of body.requetes) {
      for (const moteur of moteurs) {
        // Seul Perplexity est implémenté nativement ici ; les autres moteurs
        // (ChatGPT web search, Gemini) suivent le même contrat de retour et
        // peuvent être branchés en ajoutant un `check<Moteur>Citation`.
        if (moteur !== "perplexity") {
          continue;
        }

        const { data: previous } = await supabaseAdmin
          .from("aeo_monitoring")
          .select("statut, position")
          .eq("client_id", body.clientId)
          .eq("requete", requete)
          .eq("moteur_ia", moteur)
          .order("derniere_verif", { ascending: false })
          .limit(1)
          .maybeSingle();

        const check = await checkPerplexityCitation(requete, body.domaineCible);
        const statut = computeStatut(check);
        const evolution = computeEvolution(
          previous?.statut ?? null,
          previous?.position ?? null,
          check
        );

        const { data: inserted, error } = await supabaseAdmin
          .from("aeo_monitoring")
          .insert({
            client_id: body.clientId,
            requete,
            moteur_ia: moteur,
            domaine_cible: body.domaineCible,
            domaine_cite: check.domaine_cite,
            position: check.position,
            statut,
            sources_json: check.sources,
            evolution,
            derniere_verif: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        results.push(inserted);
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[/api/aeo/monitor]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur de monitoring AEO." },
      { status: 500 }
    );
  }
}

/** GET /api/aeo/monitor?clientId=... — dernier statut connu par (requête, moteur) */
export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId requis." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("aeo_monitoring")
    .select("*")
    .eq("client_id", clientId)
    .order("derniere_verif", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // On ne garde que la ligne la plus récente par couple (requête, moteur)
  const latestByKey = new Map<string, (typeof data)[number]>();
  for (const row of data) {
    const key = `${row.requete}__${row.moteur_ia}`;
    if (!latestByKey.has(key)) latestByKey.set(key, row);
  }

  return NextResponse.json({ rows: Array.from(latestByKey.values()) });
}