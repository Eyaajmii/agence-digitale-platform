//Tous les prompts IA
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-4-6";

/**
 * Appelle Claude en lui demandant de répondre EXCLUSIVEMENT en JSON,
 * puis parse la réponse. Lève une erreur explicite si le JSON est invalide
 * plutôt que de laisser planter silencieusement l'UI.
 */
export async function callClaudeJSON<T>(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<T> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 2000,
    system: `${params.system}\n\nRéponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises markdown.`,
    messages: [{ role: "user", content: params.prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude n'a retourné aucun contenu texte exploitable.");
  }

  const cleaned = textBlock.text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `Réponse de Claude non parsable en JSON: ${cleaned.slice(0, 300)}`
    );
  }
}

/**
 * Variante streaming, utilisée pour le générateur d'articles AEO
 * (retourne un ReadableStream consommé directement par l'UI).
 */
export async function streamClaude(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}) {
  return anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: params.maxTokens ?? 3000,
    system: params.system,
    messages: [{ role: "user", content: params.prompt }],
  });
}