import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const {
    nom,
    prenom,
    telephone,
  }: {
    nom: string;
    prenom: string;
    telephone: string;
  } = body;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      nom,
      prenom,
      telephone,
    })
    .eq("id", session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}