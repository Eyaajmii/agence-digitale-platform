import { createBrowserClient } from '@supabase/ssr'
import type { CalendrierEvent } from '@/types/calendrier'

function db() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getCalendrierEvents(): Promise<CalendrierEvent[]> {
  const supabase = db()
  const { data, error } = await supabase
    .from('calendrier')
    .select(`
      id,
      client_id,
      content_id,
      date,
      statut,
      created_at,
      contenus (
        texte,
        plateforme,
        statut
      ),
      clients (
        nom
      )
    `)
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as CalendrierEvent[]
}

export async function addCalendrierEvent(
  content_id: string,
  client_id: string,
  date: string
): Promise<CalendrierEvent> {
  const supabase = db()
  const { data, error } = await supabase
    .from('calendrier')
    .insert([{
      content_id: content_id,
      client_id: client_id,
      date,
      statut: 'planifié',
    }])
    .select(`
      id,
      client_id,
      content_id,
      date,
      statut,
      created_at,
      contenus (
        texte,
        plateforme,
        statut
      ),
      clients (
        nom
      )
    `)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as CalendrierEvent
}

export async function updateEventDate(
  id: string,
  date: string
): Promise<void> {
  const supabase = db()
  const { error } = await supabase
    .from('calendrier')
    .update({ date })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateEventStatut(
  id: string,
  statut: CalendrierEvent['statut']
): Promise<void> {
  const supabase = db()
  const { error } = await supabase
    .from('calendrier')
    .update({ statut })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function deleteCalendrierEvent(id: string): Promise<void> {
  const supabase = db()
  const { error } = await supabase
    .from('calendrier')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function getContenusValides() {
  const supabase = db()
  const { data, error } = await supabase
    .from('contenus')
    .select(`
      id,
      texte,
      plateforme,
      statut,
      client_id,
      clients (
        nom
      )
    `)
    .eq('statut', 'Apprové')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}