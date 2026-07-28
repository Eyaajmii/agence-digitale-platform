import type { CalendrierEvent } from "@/types/calendrier";

export async function getCalendrierEvents(): Promise<CalendrierEvent[]> {
  const res = await fetch("/api/calendrier");
  if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
  return res.json();
}

export async function addCalendrierEvent(
  content_id: string,
  client_id: string,
  date: string
): Promise<CalendrierEvent> {
  const res = await fetch("/api/calendrier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content_id, client_id, date }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
  return res.json();
}

export async function updateEventDate(id: string, date: string): Promise<void> {
  const res = await fetch(`/api/calendrier/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
}

export async function updateEventStatut(
  id: string,
  statut: CalendrierEvent["statut"]
): Promise<void> {
  const res = await fetch(`/api/calendrier/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
}

export async function deleteCalendrierEvent(id: string): Promise<void> {
  const res = await fetch(`/api/calendrier/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
}

export async function getContenusValides() {
  const res = await fetch("/api/calendrier/contenus-valides");
  if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
  return res.json();
}