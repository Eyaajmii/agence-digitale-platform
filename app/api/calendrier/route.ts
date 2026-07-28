import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import { cookies } from 'next/headers'
import { auth } from '@/auth'


export async function GET() {
const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role?.toLowerCase();
  let query =supabase
    .from("calendrier")
    .select(
      `
      id,
      client_id,
      content_id,
      date,
      statut,
      created_at,
      contenus (
        texte,
        plateforme,
        statut,
        objective
      ),
      clients!inner (
        nom,
        collaborateur_id,
        manager_id
      )
    `
    )
    .order("date", { ascending: true });

  if (role === "collaborateur") {
    query = query.eq("clients.collaborateur_id", session.user.id);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    let body: { content_id: string; client_id: string; date: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  
    const { content_id, client_id, date } = body;
    if (!content_id || !client_id || !date) {
      return NextResponse.json(
        { error: "Missing required fields: content_id, client_id, date" },
        { status: 400 }
      );
    }
  
    const role = session.user.role?.toLowerCase();
  
    if (role === "collaborateur") {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id, collaborateur_id")
        .eq("id", client_id)
        .single();
  
      if (clientError || !client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }
      if (client.collaborateur_id !== session.user.id) {
        return NextResponse.json(
          { error: "Vous n'êtes pas autorisé à planifier du contenu pour ce client" },
          { status: 403 }
        );
      }
    }
  
    const { data, error } =await supabase
      .from("calendrier")
      .insert([
        {
          content_id,
          client_id,
          date,
          statut: "planifié",
        },
      ])
      .select(
        `
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
      `
      )
      .single();
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  
    return NextResponse.json(data, { status: 201 });
  }