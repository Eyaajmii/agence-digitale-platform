// app/api/chat/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — charger l'historique d'une session
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const sessionId = searchParams.get("sessionId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId requis" }, { status: 400 });
  }

  if (sessionId) {
    // Charger une session spécifique
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("client_id", clientId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Lister toutes les sessions du client
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST — sauvegarder ou mettre à jour une session
export async function POST(request: NextRequest) {
  try {
    const { clientId, sessionId, messages, title } = await request.json();

    if (!clientId || !messages) {
      return NextResponse.json(
        { error: "clientId et messages sont requis" },
        { status: 400 }
      );
    }

    if (sessionId) {
      // Mise à jour d'une session existante
      const { data, error } = await supabase
        .from("chat_sessions")
        .update({ messages, title, updated_at: new Date().toISOString() })
        .eq("id", sessionId)
        .select("id")
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ id: data.id });
    }

    // Création d'une nouvelle session
    const autoTitle =
      title ||
      (messages[0]?.content?.substring(0, 40) + "..." || "Nouvelle session");

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        client_id: clientId,
        messages,
        title: autoTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — supprimer une session
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }

  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}