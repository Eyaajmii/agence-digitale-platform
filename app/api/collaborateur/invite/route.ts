import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } } 
);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXTAUTH_URL}/auth/set-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ userId: data.user.id });
}