// components/ChatDrawer.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Plus,
  Trash2,
  ChevronLeft,
  Database,
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  nom: string;
}

export default function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Charger les clients au montage
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("clients")
      .select("id, nom")
      .order("nom")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setClients(data);
          setSelectedClient(data[0].id);
          setSelectedClientName(data[0].nom);
        }
      });
  }, []);

  // Charger les sessions quand un client est sélectionné
  useEffect(() => {
    if (selectedClient) loadSessions();
  }, [selectedClient]);

  // Scroll automatique vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input quand le drawer s'ouvre
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const loadSessions = async () => {
    if (!selectedClient) return;
    const res = await fetch(`/api/chat/history?clientId=${selectedClient}`);
    if (res.ok) setSessions(await res.json());
  };

  const loadSession = async (sessionId: string) => {
    const res = await fetch(
      `/api/chat/history?clientId=${selectedClient}&sessionId=${sessionId}`
    );
    if (res.ok) {
      const session = await res.json();
      setMessages(session.messages || []);
      setCurrentSessionId(sessionId);
      setShowSessions(false);
    }
  };

  const saveSession = async (msgs: Message[]) => {
    if (!selectedClient || msgs.length === 0) return;
    const res = await fetch("/api/chat/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClient,
        sessionId: currentSessionId,
        messages: msgs,
      }),
    });
    if (res.ok) {
      const { id } = await res.json();
      if (!currentSessionId) setCurrentSessionId(id);
      loadSessions();
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/chat/history?sessionId=${sessionId}`, {
      method: "DELETE",
    });
    if (currentSessionId === sessionId) newSession();
    loadSessions();
  };

  const newSession = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowSessions(false);
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || streaming || !selectedClient) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Message vide pour l'assistant (va être rempli en streaming)
    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, clientId: selectedClient }),
      });

      if (!res.ok) throw new Error("Erreur API");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const payload = line.slice(6);
            if (payload === "[DONE]") break;
            try {
              const { text } = JSON.parse(payload);
              fullText += text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: fullText,
                };
                return updated;
              });
            } catch {}
          }
        }
      }

      // Sauvegarder la session après réponse complète
      const finalMessages = [
        ...newMessages,
        { role: "assistant" as const, content: fullText },
      ];
      saveSession(finalMessages);
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Une erreur est survenue. Réessaie.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming, selectedClient]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 1) return "Il y a moins d'1h";
    if (diffH < 24) return `Il y a ${Math.floor(diffH)}h`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le chat IA"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 50,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "#5c4ec3",
          border: "none",
          cursor: "pointer",
          display: open ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(92,78,195,0.35)",
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.transform = "scale(1.08)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
        }
      >
        <MessageSquare size={22} color="#fff" />
      </button>

      {/* Overlay sombre */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 49,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          width: "420px",
          maxWidth: "100vw",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "16px 20px",
            borderBottom: "1px solid #f1f1ef",
            flexShrink: 0,
          }}
        >
          {showSessions && (
            <button
              onClick={() => setShowSessions(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "#6b7280",
                display: "flex",
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <Sparkles size={16} color="#5c4ec3" />
          <span
            style={{ fontWeight: 700, fontSize: "14px", color: "#111827", flex: 1 }}
          >
            {showSessions ? "Sessions" : "Assistant Agence"}
          </span>

          {/* Sélecteur client */}
          {!showSessions && (
            <select
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                const found = clients.find((c) => c.id === e.target.value);
                if (found) setSelectedClientName(found.nom);
                newSession();
              }}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "4px 8px",
                background: "#f9fafb",
                color: "#374151",
                cursor: "pointer",
                maxWidth: "130px",
              }}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowSessions(!showSessions)}
            title="Historique"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#6b7280",
              display: "flex",
            }}
          >
            <Database size={16} />
          </button>
          <button
            onClick={newSession}
            title="Nouvelle session"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#6b7280",
              display: "flex",
            }}
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "#6b7280",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Bandeau RAG actif */}
        {!showSessions && selectedClientName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              background: "#f0fdf4",
              borderBottom: "1px solid #bbf7d0",
              fontSize: "11px",
              color: "#166534",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#16a34a",
                flexShrink: 0,
              }}
            />
            RAG actif —{" "}
            <span style={{ color: "#14532d" }}>{selectedClientName}</span>
          </div>
        )}

        {/* Liste des sessions */}
        {showSessions && (
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {sessions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "13px",
                  marginTop: "40px",
                }}
              >
                Aucune session enregistrée
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => loadSession(s.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    marginBottom: "6px",
                    background:
                      currentSessionId === s.id ? "#f0f0fe" : "#f9fafb",
                    border:
                      currentSessionId === s.id
                        ? "1px solid #c4b5fd"
                        : "1px solid #f1f1ef",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (currentSessionId !== s.id)
                      (e.currentTarget as HTMLElement).style.background =
                        "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    if (currentSessionId !== s.id)
                      (e.currentTarget as HTMLElement).style.background =
                        "#f9fafb";
                  }}
                >
                  <MessageSquare size={14} color="#6b7280" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#111827",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {s.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {formatTime(s.updated_at)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      color: "#d1d5db",
                      display: "flex",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#d1d5db")
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Zone de messages */}
        {!showSessions && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Message d'accueil */}
            {messages.length === 0 && (
              <div
                style={{
                  background: "#f8f7ff",
                  border: "1px solid #e0d9f7",
                  borderRadius: "14px",
                  padding: "16px",
                  fontSize: "13px",
                  color: "#4c3f9e",
                  lineHeight: "1.6",
                }}
              >
                <div
                  style={{ fontWeight: 700, marginBottom: "6px", fontSize: "14px" }}
                >
                  Bonjour ! Je suis connecté aux données de{" "}
                  <strong>{selectedClientName}</strong>.
                </div>
                <div style={{ color: "#6b5fc0" }}>
                  KPIs Meta/Google, contenus publiés et profil client. Que
                  voulez-vous analyser ?
                </div>
                {/* Suggestions rapides */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginTop: "12px",
                  }}
                >
                  {[
                    "Quelles campagnes ont le meilleur ROAS ?",
                    "Génère un post Instagram",
                    "Analyse les anomalies KPI",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "5px 10px",
                        borderRadius: "20px",
                        border: "1px solid #c4b5fd",
                        background: "#ede9fe",
                        color: "#5c4ec3",
                        cursor: "pointer",
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#f0f0fe",
                      border: "1px solid #e0d9f7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                      flexShrink: 0,
                      alignSelf: "flex-end",
                    }}
                  >
                    <Sparkles size={12} color="#5c4ec3" />
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.role === "user" ? "#5c4ec3" : "#f8f8f8",
                    color: msg.role === "user" ? "#fff" : "#1f2937",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    border:
                      msg.role === "assistant"
                        ? "1px solid #f1f1ef"
                        : "none",
                  }}
                >
                  {msg.content}
                  {/* Indicateur de streaming */}
                  {streaming &&
                    i === messages.length - 1 &&
                    msg.role === "assistant" &&
                    msg.content === "" && (
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "14px",
                          background: "#9ca3af",
                          borderRadius: "2px",
                          animation: "blink 1s step-end infinite",
                        }}
                      />
                    )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Zone de saisie */}
        {!showSessions && (
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #f1f1ef",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "8px 12px",
                transition: "border-color 0.15s",
              }}
              onFocus={() => {}}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez une question sur les KPIs, contenus..."
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "none",
                  background: "transparent",
                  fontSize: "13px",
                  color: "#111827",
                  outline: "none",
                  lineHeight: "1.5",
                  maxHeight: "100px",
                  overflowY: "auto",
                  fontFamily: "inherit",
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 100) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background:
                    input.trim() && !streaming ? "#5c4ec3" : "#e5e7eb",
                  border: "none",
                  cursor:
                    input.trim() && !streaming ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <Send
                  size={14}
                  color={input.trim() && !streaming ? "#fff" : "#9ca3af"}
                />
              </button>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#9ca3af",
                textAlign: "center",
                marginTop: "6px",
              }}
            >
              Entrée pour envoyer · Shift+Entrée pour saut de ligne
            </div>
          </div>
        )}

        {/* CSS animation curseur */}
        <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      </div>
    </>
  );
}