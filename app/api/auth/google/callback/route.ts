import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCodeForToken } from "@/lib/google/api";
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
    const tokenData = await exchangeGoogleCodeForToken(code);

    // نلمو الداتا الحساسة الكل مع بعضها بما فيها الـ refresh_token والـ access_token
    const secretPayload = JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token, // مهم ياسر للـ Cron Jobs باش تجددي بيه الـ access_token كي يموت بعد ساعة
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

    // نعيطو للـ RPC باش تتشفر الداتا بـ AES-256 في وسط الـ Vault
    const { error } = await supabaseAdmin.rpc("insert_oauth_secret", {
      p_client_id: clientId,
      p_provider: "google",
      p_access_token: tokenData.access_token,
      p_refresh_token: tokenData.refresh_token,
      p_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });

    if (error) throw error;

    return NextResponse.redirect(
      `${process.env.AUTH_URL}/oauth-success?client=${clientId}`
    );
  } catch (error: any) {
    console.error("Erreur Google Vault OAuth:", error);
  
    // Supabase PostgrestError a cette forme : { message, details, hint, code }
    const errorMessage =
      error?.message ||
      error?.error_description ||
      error?.error ||
      (typeof error === "string" ? error : JSON.stringify(error));
  
    return NextResponse.json(
      {
        error: "Erreur OAuth Google",
        details: errorMessage,
        code: error?.code || null,
      },
      { status: 500 }
    );
  }
}
