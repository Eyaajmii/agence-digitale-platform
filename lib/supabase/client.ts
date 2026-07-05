import { createBrowserClient } from '@supabase/ssr'
import { getSession } from 'next-auth/react'

import type {
  Client,
  ClientFormData,
  PaginatedClients,
} from '@/types/clients'

// ─── Helper : crée un client frais à chaque appel ─────────────
// IMPORTANT : ne jamais stocker dans une const au niveau du module
// sinon la session n'est pas lue correctement côté navigateur
function db() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─────────────────────────────────────────────
// LECTURE
// ─────────────────────────────────────────────

/*export async function getClients(
  page = 1,
  perPage = 10,
  search = ''
): Promise<PaginatedClients> {
  const supabase = db()
  const from = (page - 1) * perPage
  const to   = from + perPage - 1

  let query = supabase
  .from('clients')
  .select(
    `
      *,
      collaborateurs (
        id,
        profiles (
          nom,
          prenom
        )
      )
    `,
    { count: 'exact' }
  )
  .order('created_at', { ascending: false })
  .range(from, to)

  if (search) query = query.ilike('nom', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    data:        data as Client[],
    total:       count ?? 0,
    page,
    per_page:    perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  }
}*/
export async function getClients(
  page = 1,
  perPage = 10,
  search = ""
): Promise<PaginatedClients> {

  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    search,
  });

  const res = await fetch(`/api/clients?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Erreur lors du chargement des clients");
  }

  return await res.json();
}

export async function getClientById(id: string): Promise<Client> {
  const supabase = db()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Client
}

// ─────────────────────────────────────────────
// CRÉATION
// ─────────────────────────────────────────────

export async function addClient(form: ClientFormData): Promise<Client> {
  const supabase = db()
 
  // NextAuth gère la session → on récupère l'user via getSession()
  const session = await getSession()
  if (!session?.user) throw new Error('Utilisateur non connecté')
 
  // manager_id = l'id de l'user NextAuth
  // selon ta config NextAuth, l'id est dans session.user.id
  const managerId = (session.user as { id?: string }).id ?? session.user.email
  console.log("FORM =", form);
  const { data, error } = await supabase
    .from('clients')
    .insert([{ ...formToRow(form), manager_id: managerId }])
    .select()
    .single()
 
  if (error) throw new Error(error.message)
  return data as Client
}

// ─────────────────────────────────────────────
// MISE À JOUR
// ─────────────────────────────────────────────

export async function updateClient(
  id: string,
  form: ClientFormData
): Promise<Client> {
  const supabase = db()
  const { data, error } = await supabase
    .from('clients')
    .update(formToRow(form))
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Client
}

// ─────────────────────────────────────────────
// SUPPRESSION
// ─────────────────────────────────────────────

export async function deleteClient(id: string): Promise<void> {
  const supabase = db()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─────────────────────────────────────────────
// UTILITAIRE INTERNE
// ─────────────────────────────────────────────

function formToRow(form: ClientFormData) {
  return {
    nom:            form.nom,
    secteur:        form.secteur,
    ton:            form.ton,
    mots_interdits: form.mots_interdits
                      .split(',')
                      .map((m) => m.trim())
                      .filter(Boolean),
    exemples:       form.exemples,
    email:form.email,
    collaborateur_id: form.collaborateur_id,
    statut:form.statut,
  }
}