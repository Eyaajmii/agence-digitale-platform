import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/server";
import { auth } from "@/auth";
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role?.toLowerCase();

  let query = supabase
    .from("contenus")
    .select(
      `
      id,
      texte,
      plateforme,
      statut,
      client_id,
      clients!inner (
        nom,
        collaborateur_id,
        manager_id
      )
    `
    )
    .eq("statut", "Approuvé")
    .order("created_at", { ascending: false });

  if (role === "collaborateur") {
    query = query.eq("clients.collaborateur_id", session.user.id);
  }
  const { data, error } = await query;

  if (error) {
    console.error("GET /api/calendrier/contenus-valides error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}