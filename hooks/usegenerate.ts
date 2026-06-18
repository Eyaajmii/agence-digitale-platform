"use client";

import { useState, useCallback, useRef } from "react";

export interface GenerateParams {
  clientId: string;
  platform: string;
  objective: string;
}

export interface GenerateResult {
  variants: string[];
  contentId: string | null;
  usage?: { input_tokens: number; output_tokens: number };
  model?: string;
}

export function useGenerate() {
  const [streamedText, setStreamedText] = useState("");
  const [variants, setVariants] = useState<string[]>([]);
  const [contentId, setContentId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (params: GenerateParams) => {
    // Cancel any ongoing request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStreamedText("");
    setVariants([]);
    setContentId(null);
    setError(null);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (separated by \n\n)
        const messages = buffer.split("\n\n");
        buffer = messages.pop() ?? ""; // keep incomplete last chunk

        for (const message of messages) {
          if (!message.trim()) continue;

          // Parse "event: xxx\ndata: yyy"
          const lines = message.split("\n");
          let eventType = "message";
          let dataStr = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) dataStr = line.slice(6).trim();
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            switch (eventType) {
              case "delta":
                setStreamedText((prev) => prev + (data.text ?? ""));
                break;

              case "complete":
                setVariants(data.variants ?? []);
                setContentId(data.contentId ?? null);
                break;

              case "error":
                throw new Error(data.message ?? "Unknown streaming error");
            }
          } catch (parseErr) {
            // ignore JSON parse errors for non-data lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { generate, cancel, streamedText, variants, contentId, isStreaming, error };
}