'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addClient } from '@/lib/supabase/client'
import type { ClientFormData, Exemple, Platforme } from '@/types/clients'
import { SECTOR_OPTIONS, TON_OPTIONS, PLATFORM_LABELS } from '@/types/clients'
import { getCollaborateurs } from '@/lib/supabase/collaborateur'

const emptyForm: ClientFormData = {
  nom:            '',
  secteur:        'E-commerce',
  ton:            'professionnel',
  mots_interdits: '',
  exemples:       [],
  collaborateur_id:'',
}

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm]       = useState<ClientFormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [collaborateurs, setCollaborateurs] = useState<any[]>([])
  useEffect(() => {
    async function load() {
      const data = await getCollaborateurs()
      setCollaborateurs(data)
    }
  
    load()
  }, [])
  function set<K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Exemples ──────────────────────────────────────────────
  function addExemple() {
    set('exemples', [
      ...form.exemples,
      { platforme: 'instagram', text: '' },
    ])
  }

  function updateExemple(i: number, field: keyof Exemple, value: string) {
    set('exemples', form.exemples.map((ex, idx) =>
      idx === i ? { ...ex, [field]: value } : ex
    ))
  }

  function removeExemple(i: number) {
    set('exemples', form.exemples.filter((_, idx) => idx !== i))
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const client = await addClient(form)
      router.push(`/dashboard/clients`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ← Clients
        </Link>
        <span className="text-zinc-200">/</span>
        <h1 className="text-xl font-semibold text-zinc-900">Nouveau client</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Infos générales ─────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Infos générales
          </h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Nom du client <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={(e) => set('nom', e.target.value)}
              placeholder="Ex : Boutique Élara"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">Secteur</label>
              <select
                value={form.secteur}
                onChange={(e) => set('secteur', e.target.value as ClientFormData['secteur'])}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                {SECTOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-zinc-700">Ton</label>
              <select
                value={form.ton}
                onChange={(e) => set('ton', e.target.value as ClientFormData['ton'])}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              >
                {TON_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Profil IA ────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Profil IA
          </h2>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700">
              Mots interdits
            </label>
            <input
              type="text"
              value={form.mots_interdits}
              onChange={(e) => set('mots_interdits', e.target.value)}
              placeholder="pas cher, discount, promo…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
            <p className="text-xs text-zinc-400">Séparés par des virgules</p>
          </div>
        </section>

        {/* ── Exemples few-shot ────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Exemples de contenus
            </h2>
            <button
              type="button"
              onClick={addExemple}
              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
            >
              + Ajouter
            </button>
          </div>

          {form.exemples.length === 0 ? (
            <p className="rounded-lg border border-dashed border-zinc-200 py-8 text-center text-xs text-zinc-400">
              Ajoutez des copies validées pour améliorer la génération IA
            </p>
          ) : (
            <div className="space-y-3">
              {form.exemples.map((ex, i) => (
                <div key={i} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <select
                      value={ex.platforme}
                      onChange={(e) => updateExemple(i, 'platforme', e.target.value)}
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-violet-500"
                    >
                      {(Object.keys(PLATFORM_LABELS) as Platforme[]).map((p) => (
                        <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <select
                        value={ex.performance ?? ''}
                        onChange={(e) => updateExemple(i, 'performance', e.target.value)}
                        className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs outline-none focus:border-violet-500"
                      >
                        <option value="">Performance</option>
                        <option value="bon">Bon</option>
                        <option value="excellent">Excellent</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeExemple(i)}
                        className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={ex.text}
                    onChange={(e) => updateExemple(i, 'text', e.target.value)}
                    placeholder="Colle ici une copie publicitaire validée…"
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-violet-500 resize-none"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Actions ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Création…
              </>
            ) : 'Créer le client'}
          </button>
          <Link
            href="/dashboard/clients"
            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </Link>
        </div>

      </form>
    </div>
  )
}