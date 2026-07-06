import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("contenus")
      .select(`
        *,
        clients (
          id,
          nom,
          secteur,
          ton
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error: "Contenu introuvable",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erreur récupération contenu",
      },
      {
        status: 500,
      }
    );
  }
}