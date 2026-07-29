import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function callGroqJSON<T>(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<T> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: params.maxTokens ?? 2000,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${params.system}\n\nRéponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises markdown.`,
      },
      { role: "user", content: params.prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("Réponse vide de Groq");
  }

  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error("Erreur parsing JSON Groq:", raw);
    throw new Error("Réponse Groq non parsable en JSON");
  }
}
export async function streamGroq(params: {
    system: string;
    prompt: string;
    maxTokens?: number;
  }) {
    return groq.chat.completions.create({
      model: GROQ_MODEL,
      stream: true,
      max_tokens: params.maxTokens ?? 3000,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: params.system,
        },
        {
          role: "user",
          content: params.prompt,
        },
      ],
});
}
