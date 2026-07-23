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
    if (session.user.role?.toLowerCase() === "collaborateur") {
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
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const supabase = await makeSupabase();
  const body = await req.json();
  const { nom, secteur, ton, mots_interdits, exemples, email, statut } = body;

  if (!nom) {
    return NextResponse.json({ error: 'Le champ nom est obligatoire' }, { status: 422 });
  }

  // Convertit "mot1, mot2" -> ["mot1", "mot2"], et "" -> []
  const toArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const { data, error } = await supabase
    .from('clients')
    .insert([{
      nom,
      statut:         statut  ?? null,
      secteur:        secteur ?? null,
      ton:            ton     ?? null,
      mots_interdits: toArray(mots_interdits),
      exemples:       toArray(exemples),
      email:          email   ?? null,
      manager_id:     session.user.id,
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data, { status: 201 });
}