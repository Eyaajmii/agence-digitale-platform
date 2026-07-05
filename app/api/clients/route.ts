import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { auth } from "@/auth";

async function makeSupabase() {
  const cookieStore =await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}

// ─── GET /api/clients ────────────────────────────────────────
// Retourne la liste paginée des clients du manager connecté
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const supabase = makeSupabase()
  const { searchParams } = new URL(req.url)

  const page    = parseInt(searchParams.get('page')     ?? '1')
  const perPage = parseInt(searchParams.get('per_page') ?? '10')
  const search  = searchParams.get('search') ?? ''
  const from    = (page - 1) * perPage
  const to      = from + perPage - 1

  let query = (await supabase)
    .from('clients')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    if (session.user.role === "Collaborateur") {
      query = query.eq("collaborateur_id", session.user.id);
    }

  if (search) query = query.ilike('nom', `%${search}%`)
  query = query.range(from, to);
  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({
    data,
    total:       count ?? 0,
    page,
    per_page:    perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  })
}

// ─── POST /api/clients ───────────────────────────────────────
// Crée un nouveau client — manager_id = utilisateur connecté
export async function POST(req: NextRequest) {
  const supabase = makeSupabase()

  const { data: { user } } = await (await supabase).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { nom, secteur, ton, mots_interdits, exemples,email ,statut} = body

  if (!nom) {
    return NextResponse.json({ error: 'Le champ nom est obligatoire' }, { status: 422 })
  }

  const { data, error } = await (await supabase)
    .from('clients')
    .insert([{
      nom,
      statut:statut??null,
      secteur:        secteur        ?? null,
      ton:            ton            ?? null,
      mots_interdits: mots_interdits ?? [],
      exemples:       exemples       ?? [],
      email:email??null,
      manager_id:     user.id,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data, { status: 201 })
}