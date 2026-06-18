import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function makeSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = makeSupabase()

  const { data, error } = await (await supabase)
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })

  return NextResponse.json(data)
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = makeSupabase()

  const { data: { user } } = await (await supabase).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()

  // On accepte uniquement les colonnes de la table
  const allowed = ['nom', 'secteur', 'ton', 'mots_interdits', 'exemples']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 422 })
  }

  const { data, error } = await (await supabase)
    .from('clients')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = makeSupabase()

  const { data: { user } } = await (await supabase).auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { error } = await (await supabase)
    .from('clients')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return new NextResponse(null, { status: 204 })
}