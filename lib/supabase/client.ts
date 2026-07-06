import { createBrowserClient } from '@supabase/ssr'
import { getSession } from 'next-auth/react'

import type {
  Client,
  ClientFormData,
  PaginatedClients,
} from '@/types/clients'

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
  const res = await fetch(`/api/clients/${id}`);

  if (!res.ok) {
    throw new Error("Erreur lors du chargement du client");
  }

  return await res.json();
}

// ─────────────────────────────────────────────
// CRÉATION
// ─────────────────────────────────────────────

export async function addClient(form: ClientFormData): Promise<Client> {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur lors de la création");
  }

  return await res.json();
}

// ─────────────────────────────────────────────
// MISE À JOUR
// ─────────────────────────────────────────────

export async function updateClient(
  id: string,
  form: ClientFormData
): Promise<Client> {
  const res = await fetch(`/api/clients/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur lors de la modification");
  }

  return await res.json();
}

// ─────────────────────────────────────────────
// SUPPRESSION
// ─────────────────────────────────────────────

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`/api/clients/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur lors de la suppression");
  }
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