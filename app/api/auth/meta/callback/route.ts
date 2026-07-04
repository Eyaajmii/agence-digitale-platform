import { NextRequest, NextResponse } from "next/server";
import { exchangeMetaCodeForToken } from "@/lib/meta/api";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const clientId = req.nextUrl.searchParams.get("state");

  if (!code || !clientId) {
    return NextResponse.json(
      { error: "Code OAuth invalide" },
      { status: 400 }
    );
  }

  try {
    const tokenData = await exchangeMetaCodeForToken(code);

    // صنع الـ Payload اللي فيه التوكن ووقت وفاته
    const secretPayload = JSON.stringify({
      access_token: tokenData.access_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

    // تعيطي للـ RPC اللي تصب مشفر بـ AES-256 في وسط الـ Vault
    const { error } = await supabaseAdmin.rpc("insert_oauth_secret", {
      p_client_id: clientId,
      p_provider: "meta",
      p_secret_data: secretPayload,
    });

    if (error) throw error;

    return NextResponse.redirect(
      `${process.env.AUTH_URL}/dashboard/clients/${clientId}`
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur OAuth Meta" },
      { status: 500 }
    );
  }
}
