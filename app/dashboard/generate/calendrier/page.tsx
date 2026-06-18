//calendrier editoriel
'use client'

import { useEffect, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import type { DateClickArg } from '@fullcalendar/interaction'
import type { EventDropArg, EventClickArg } from '@fullcalendar/core'
import {
  getCalendrierEvents,
  addCalendrierEvent,
  updateEventDate,
  updateEventStatut,
  deleteCalendrierEvent,
  getContenusValides,
} from '@/lib/supabase/calendrier'
import type { CalendrierEvent } from '@/types/calendrier'

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  facebook:  '#1877F2',
  twitter:   '#1DA1F2',
  linkedin:  '#0A66C2',
  google_ads:'#34A853',
}

const STATUT_COLORS: Record<string, string> = {
  planifié: '#7F77DD',
  publié:   '#1D9E75',
  annulé:   '#D85A30',
}

export default function CalendrierPage() {
  const [events, setEvents]           = useState<CalendrierEvent[]>([])
  const [contenus, setContenus]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendrierEvent | null>(null)
  const [selectedContenu, setSelectedContenu] = useState('')
  const [saving, setSaving]           = useState(false)

  const load = useCallback(async () => {
    try {
      const [evts, cnts] = await Promise.all([
        getCalendrierEvents(),
        getContenusValides(),
      ])
      setEvents(evts)
      setContenus(cnts)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Convertir les events pour FullCalendar
  const fcEvents = events.map((e) => ({
    id: e.id,
    title: `${e.contenus?.plateforme?.toUpperCase()} — ${e.clients?.nom ?? ''}`,
    date: e.date,
    backgroundColor: PLATFORM_COLORS[e.contenus?.plateforme ?? ''] ?? '#7F77DD',
    borderColor: STATUT_COLORS[e.statut] ?? '#7F77DD',
    extendedProps: { event: e },
  }))

  // Clic sur une date → ouvrir modal pour planifier
  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr)
    setSelectedEvent(null)
    setSelectedContenu('')
    setShowModal(true)
  }

  // Clic sur un event → voir détail
  const handleEventClick = (arg: EventClickArg) => {
    const e = arg.event.extendedProps.event as CalendrierEvent
    setSelectedEvent(e)
    setSelectedDate(null)
    setShowModal(true)
  }

  // Drag & drop → mise à jour optimiste de la date
  const handleEventDrop = async (arg: EventDropArg) => {
    const eventId = arg.event.id
    const newDate = arg.event.startStr

    // Mise à jour optimiste
    setEvents((prev) =>
      prev.map((e) => e.id === eventId ? { ...e, date: newDate } : e)
    )

    try {
      await updateEventDate(eventId, newDate)
    } catch {
      // Rollback si erreur
      arg.revert()
      await load()
    }
  }

  // Planifier un contenu
  const handlePlanifier = async () => {
    if (!selectedDate || !selectedContenu) return
    setSaving(true)
    try {
      const contenu = contenus.find((c) => c.id === selectedContenu)
      if (!contenu) return
      const newEvent = await addCalendrierEvent(
        selectedContenu,
        contenu.client_id,
        selectedDate
      )
      setEvents((prev) => [...prev, newEvent])
      setShowModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // Changer statut
  const handleStatut = async (statut: CalendrierEvent['statut']) => {
    if (!selectedEvent) return
    await updateEventStatut(selectedEvent.id, statut)
    setEvents((prev) =>
      prev.map((e) => e.id === selectedEvent.id ? { ...e, statut } : e)
    )
    setSelectedEvent((prev) => prev ? { ...prev, statut } : prev)
  }

  // Supprimer
  const handleDelete = async () => {
    if (!selectedEvent) return
    if (!confirm('Supprimer cet événement ?')) return
    await deleteCalendrierEvent(selectedEvent.id)
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Calendrier éditorial
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Cliquez sur une date pour planifier un contenu validé
          </p>
        </div>
        {/* Légende */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          {Object.entries(STATUT_COLORS).map(([s, c]) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: c }} />
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale="fr"
          headerToolbar={{
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,listWeek',
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
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4">

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
                        [{c.plateforme}] {c.clients?.nom} — {c.texte.slice(0, 50)}…
                      </option>
                    ))}
                  </select>
                </div>

                {contenus.length === 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Aucun contenu validé. Validez d'abord une variante dans le Générateur.
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handlePlanifier}
                    disabled={!selectedContenu || saving}
                    className="flex-1 bg-violet-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-violet-700 disabled:opacity-40 transition-colors"
                  >
                    {saving ? 'Planification…' : 'Planifier'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-zinc-200 text-zinc-600 text-sm font-medium py-2.5 rounded-lg hover:bg-zinc-50 transition-colors"
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
                    <span className="font-medium">{selectedEvent.clients?.nom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Plateforme :</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                      style={{ background: PLATFORM_COLORS[selectedEvent.contenus?.plateforme ?? ''] ?? '#7F77DD' }}
                    >
                      {selectedEvent.contenus?.plateforme}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Date :</span>
                    <span>{new Date(selectedEvent.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Texte :</span>
                    <p className="mt-1 bg-zinc-50 rounded-lg p-3 text-zinc-700 leading-relaxed">
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
                    {(['planifié', 'publié', 'annulé'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatut(s)}
                        className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${
                          selectedEvent.statut === s
                            ? 'text-white border-transparent'
                            : 'text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                        }`}
                        style={selectedEvent.statut === s
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
  )
}