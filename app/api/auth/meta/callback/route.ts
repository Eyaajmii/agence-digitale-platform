import { NextRequest, NextResponse } from "next/server";
import {
  exchangeMetaCodeForToken,
  listMetaAdAccounts,
  listMetaBusinesses,
  exchangeMetaLongLivedToken,
} from "@/lib/meta/api";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const clientId = req.nextUrl.searchParams.get("state");

  if (!code || !clientId) {
    return NextResponse.json({ error: "Code OAuth invalide" }, { status: 400 });
  }

  try {
    const tokenData = await exchangeMetaCodeForToken(code);
    //const longLivedToken = await exchangeMetaLongLivedToken(tokenData.access_token);
    const adsmMeta = await listMetaAdAccounts(tokenData.access_token);
    const metaBuss = await listMetaBusinesses(tokenData.access_token);
    /*
    // صنع الـ Payload اللي فيه التوكن ووقت وفاته
    const secretPayload = JSON.stringify({
      access_token: tokenData.access_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    });*/
    console.log("META TOKEN DATA");
    console.log(JSON.stringify(tokenData, null, 2));

    console.log("REFRESH TOKEN =", tokenData.refresh_token);
    // تعيطي للـ RPC اللي تصب مشفر بـ AES-256 في وسط الـ Vault
    const rpcPayload = {
      p_client_id: clientId,
      p_provider: "meta",
      p_access_token: tokenData.access_token,
      p_refresh_token: tokenData.refresh_token ?? "",
      p_expires_at: new Date(
        Date.now() + tokenData.expires_in * 1000
      ).toISOString(),
      p_account_id: adsmMeta?.[0]?.id ?? null,
    };
    
    console.log("RPC PAYLOAD");
    console.log(JSON.stringify(rpcPayload, null, 2));
    
    const { error } = await supabaseAdmin.rpc(
      "insert_oauth_secret",
      rpcPayload
    );

    if (error) throw error;

    const { error: clientUpdateError } = await supabaseAdmin
      .from("clients")
      .update({
        meta_ad_account_id: adsmMeta?.[0]?.id || null,
        meta_business_id: metaBuss?.[0]?.id || null,
      })
      .eq("id", clientId);

    if (clientUpdateError) {
      console.error("Erreur mise à jour clients Meta:", clientUpdateError);
      // on ne bloque pas le redirect, les tokens sont déjà bien sauvegardés
    }

    return NextResponse.redirect(
      `${process.env.AUTH_URL}/oauth-success?client=${clientId}`
    );
  } catch (error: any) {
    console.error("Erreur meta Vault OAuth:", error);
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
