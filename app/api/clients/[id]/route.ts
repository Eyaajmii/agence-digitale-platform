import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { auth } from '@/auth' // adapte le chemin, c'est ton export NextAuth v5

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = makeSupabase()

  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      collaborateurs (
        id,
        profiles (
          nom,
          prenom
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const supabase = makeSupabase()
  const body = await req.json()

  const allowed = ['nom', 'secteur', 'ton', 'mots_interdits', 'exemples', 'email','statut','collaborateur_id']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }
  if ('mots_interdits' in updates) {
    const raw = updates.mots_interdits
    updates.mots_interdits = typeof raw === 'string'
      ? raw.split(',').map((m) => m.trim()).filter(Boolean)
      : (raw ?? [])
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const supabase = makeSupabase()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return new NextResponse(null, { status: 204 })
}