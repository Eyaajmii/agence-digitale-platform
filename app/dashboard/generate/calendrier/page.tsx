//calendrier editoriel
"use client";

import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventDropArg, EventClickArg } from "@fullcalendar/core";
import {
  getCalendrierEvents,
  addCalendrierEvent,
  updateEventDate,
  updateEventStatut,
  deleteCalendrierEvent,
  getContenusValides,
} from "@/lib/supabase/calendrier";
import type { CalendrierEvent } from "@/types/calendrier";

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#FF3D7F",
  Facebook: "#2D6FF2",
  Twitter: "#6C4CFF",
  Linkedin: "#2BB7C4",
  GoogleAds: "#D6A32C",
  TikTok: "#1A1720",
};

const STATUT_COLORS: Record<string, string> = {
  planifié: "#6C4CFF",
  publié: "#3FAE6B",
  annulé: "#FF3D7F",
};

export default function CalendrierPage() {
  const [events, setEvents] = useState<CalendrierEvent[]>([]);
  const [contenus, setContenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendrierEvent | null>(
    null
  );
  const [selectedContenu, setSelectedContenu] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [evts, cnts] = await Promise.all([
        getCalendrierEvents(),
        getContenusValides(),
      ]);
      setEvents(evts);
      setContenus(cnts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      .fc {
        font-family: Inter,sans-serif;
      }
  
      .fc-toolbar-title {
        font-family: Space Grotesk,sans-serif;
        font-weight: 700;
        color: #1A1720;
      }
  
      .fc-button {
        background: white !important;
        border: 1px solid rgba(26,23,32,.1) !important;
        color: #6B6579 !important;
        box-shadow: none !important;
      }
  
      .fc-button:hover {
        background: #F4F5F1 !important;
      }
  
      .fc-button-active {
        background: blue !important;
        color: white !important;
        border-color: blue !important;
      }
  
      .fc-daygrid-day:hover {
        background: rgba(255,61,127,.03);
      }
  
      .fc-col-header-cell {
        background: #F4F5F1;
        color: #9C96B5;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: .12em;
        font-family: IBM Plex Mono, monospace;
      }
  
      .fc-event {
        border-radius: 8px;
        border: none !important;
        padding: 2px 6px;
        font-size: 12px;
        font-weight: 500;
      }
  
      .fc-day-today {
        background: rgba(108,76,255,.05) !important;
      }
    `;

    document.head.appendChild(style);

    return () => void document.head.removeChild(style);
  }, []);
  // Convertir les events pour FullCalendar
  const fcEvents = events.map((e) => ({
    id: e.id,
    title: `${e.contenus?.plateforme?.toUpperCase()} — ${e.clients?.nom ?? ""}`,
    date: e.date,
    backgroundColor: PLATFORM_COLORS[e.contenus?.plateforme ?? ""] ?? "#7F77DD",
    borderColor: STATUT_COLORS[e.statut] ?? "#7F77DD",
    extendedProps: { event: e },
  }));

  // Clic sur une date → ouvrir modal pour planifier
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setSelectedEvent(null);
    setSelectedContenu("");
    setShowModal(true);
  };

  // Clic sur un event → voir détail
  const handleEventClick = (arg: EventClickArg) => {
    const e = arg.event.extendedProps.event as CalendrierEvent;
    setSelectedEvent(e);
    setSelectedDate(null);
    setShowModal(true);
  };

  // Drag & drop → mise à jour optimiste de la date
  const handleEventDrop = async (arg: EventDropArg) => {
    const eventId = arg.event.id;
    const newDate = arg.event.startStr;

    // Mise à jour optimiste
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, date: newDate } : e))
    );

    try {
      await updateEventDate(eventId, newDate);
    } catch {
      // Rollback si erreur
      arg.revert();
      await load();
    }
  };

  // Planifier un contenu
  const handlePlanifier = async () => {
    if (!selectedDate || !selectedContenu) return;
    setSaving(true);
    try {
      const contenu = contenus.find((c) => c.id === selectedContenu);
      if (!contenu) return;
      const newEvent = await addCalendrierEvent(
        selectedContenu,
        contenu.client_id,
        selectedDate
      );
      setEvents((prev) => [...prev, newEvent]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Changer statut
  const handleStatut = async (statut: CalendrierEvent["statut"]) => {
    if (!selectedEvent) return;
    await updateEventStatut(selectedEvent.id, statut);
    setEvents((prev) =>
      prev.map((e) => (e.id === selectedEvent.id ? { ...e, statut } : e))
    );
    setSelectedEvent((prev) => (prev ? { ...prev, statut } : prev));
  };

  // Supprimer
  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm("Supprimer cet événement ?")) return;
    await deleteCalendrierEvent(selectedEvent.id);
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-[Space_Grotesk,sans-serif] font-bold text-[#1A1720] tracking-tight">
            Calendrier éditorial
          </h1>

          <p className="mt-1 text-sm text-[#6B6579] font-[IBM_Plex_Mono,monospace]">
            Planification et suivi des publications
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {Object.entries(STATUT_COLORS).map(([s, c]) => (
            <div
              key={s}
              className="flex items-center gap-2 rounded-full bg-white border border-[#1A1720]/10 px-3 py-1.5"
            >
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c }}
              />
              <span className="text-xs text-[#6B6579] capitalize font-[IBM_Plex_Mono,monospace]">
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendrier */}
      <div className="overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-white p-5">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale="fr"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          }}
          events={fcEvents}
          editable={true}
          droppable={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative overflow-hidden rounded-3xl border border-[#1A1720]/10 bg-white p-6 w-full max-w-lg space-y-5">
            {/* Modal — Planifier */}
            {selectedDate && !selectedEvent && (
              <>
                <h2 className="text-base font-semibold text-zinc-900">
                  Planifier un contenu
                </h2>
                <p className="text-sm text-zinc-500">
                  Date : <strong>{selectedDate}</strong>
                </p>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700">
                    Contenu validé
                  </label>
                  <select
                    value={selectedContenu}
                    onChange={(e) => setSelectedContenu(e.target.value)}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">— Choisir un contenu —</option>
                    {contenus.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.plateforme}] {c.clients?.nom} —{" "}
                        {c.texte?.slice(0, 50) ?? ""}
                      </option>
                    ))}
                  </select>
                </div>

                {contenus.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Aucun contenu validé. Validez d'abord une variante dans le
                    Générateur.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePlanifier}
                    disabled={!selectedContenu || saving}
                    className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-medium text-white hover:bg-blue-400 transition-colors disabled:opacity-40"
                  >
                    {saving ? "Planification…" : "Planifier"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl border border-[#1A1720]/10 py-2.5 text-sm font-medium text-[#6B6579] hover:bg-[#F4F5F1] transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}

            {/* Modal — Détail event */}
            {selectedEvent && (
              <>
                <h2 className="text-base font-semibold text-zinc-900">
                  Détail du contenu planifié
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Client :</span>
                    <span className="font-medium">
                      {selectedEvent.clients?.nom}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Plateforme :</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                      style={{
                        background:
                          PLATFORM_COLORS[
                            selectedEvent.contenus?.plateforme ?? ""
                          ] ?? "#7F77DD",
                      }}
                    >
                      {selectedEvent.contenus?.plateforme}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Objective :</span>
                    <span className="font-medium">
                      {selectedEvent.contenus?.objective}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Date :</span>
                    <span>
                      {new Date(selectedEvent.date).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Texte :</span>
                    <p className="mt-2 rounded-xl border border-[#1A1720]/10 bg-[#F4F5F1] p-4 text-sm leading-relaxed text-[#1A1720] whitespace-pre-wrap">
                      {selectedEvent.contenus?.texte}
                    </p>
                  </div>
                </div>

                {/* Changer statut */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Statut
                  </p>
                  <div className="flex gap-2">
                    {(["planifié", "publié", "annulé"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatut(s)}
                        className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                          selectedEvent.statut === s
                            ? "text-white shadow-sm"
                            : "border border-[#1A1720]/10 text-[#6B6579] hover:bg-[#F4F5F1]"
                        }`}
                        style={
                          selectedEvent.statut === s
                            ? { background: STATUT_COLORS[s] }
                            : {}
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleDelete}
                    className="flex-1 border border-red-100 text-red-500 text-sm font-medium py-2.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-zinc-200 text-zinc-600 text-sm font-medium py-2.5 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
