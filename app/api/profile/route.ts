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

  const { data: profile, error } = await supabaseAdmin
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

  let manager = null;

  if (profile.role === "manager") {
    const { data } = await supabaseAdmin
      .from("managers")
      .select("*")
      .eq("id", session.user.id)
      .single();

    manager = data;
  }

  return NextResponse.json({
    profile,
    manager,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Non autorisé" },
      { status: 401 }
    );
  }

  const {
    nom,
    prenom,
    telephone,
    poste,
    bio,
    ville,
    pays,
    role,
    nom_agence,
    adresse_agence,
    email_agence,
    fax_agence,
  } = await req.json();

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .update({
      nom,
      prenom,
      telephone,
      poste,
      ville,
      pays,
      updated_at: new Date().toISOString(),
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

  let manager = null;

  if (role === "manager") {
    const { data: managerData, error: managerError } =
      await supabaseAdmin
        .from("managers")
        .update({
          nom_agence,
          adresse_agence,
          email_agence,
          fax_agence,
        })
        .eq("id", session.user.id)
        .select()
        .single();

    if (managerError) {
      return NextResponse.json(
        { error: managerError.message },
        { status: 500 }
      );
    }

    manager = managerData;
  }

  return NextResponse.json({
    profile,
    manager,
  });
}