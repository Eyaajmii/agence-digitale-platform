import { NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCodeForToken } from "@/lib/google/api";
import {
  listGoogleAdsCustomers,
  listSearchConsoleSites,
} from "@/lib/google/api";
import { listGA4Properties } from "@/lib/google/api";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const clientId = req.nextUrl.searchParams.get("state");

  if (!code || !clientId) {
    return NextResponse.json({ error: "Code OAuth invalide" }, { status: 400 });
  }

  try {
    const tokenData = await exchangeGoogleCodeForToken(code);
    console.log("TOKEN OK");
    //const adsCustomers = await listGoogleAdsCustomers(tokenData.access_token);
    //console.log("ADS OK");
    const ga4Properties = await listGA4Properties(tokenData.access_token);
    console.log("GA4 OK");

    const gscSites = await listSearchConsoleSites(tokenData.access_token);
    console.log("GSC OK");
    console.log("GA4 PROPERTIES:", JSON.stringify(ga4Properties, null, 2));

    console.log("GSC SITES:", JSON.stringify(gscSites, null, 2));

    console.log(
      "GA4 PROPERTY CHOISIE:",
      ga4Properties?.[0]?.propertySummaries?.[0]?.property
    );

    console.log("GSC SITE CHOISI:", gscSites?.[0]?.siteUrl);

    console.log("CLIENT ID:", clientId);
    /* نلمو الداتا الحساسة الكل مع بعضها بما فيها الـ refresh_token والـ access_token
    const secretPayload = JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token, // مهم ياسر للـ Cron Jobs باش تجددي بيه الـ access_token كي يموت بعد ساعة
      expires_at: new Date(
        Date.now() + tokenData.expires_in * 1000
      ).toISOString(),
    });*/
    
    // نعيطو للـ RPC باش تتشفر الداتا بـ AES-256 في وسط الـ Vault
    const { error } = await supabaseAdmin.rpc("insert_oauth_secret", {
      p_client_id: clientId,
      p_provider: "google",
      p_access_token: tokenData.access_token,
      p_refresh_token: tokenData.refresh_token,
      p_expires_at: new Date(
        Date.now() + tokenData.expires_in * 1000
      ).toISOString(),
      //p_account_id: adsCustomers?.[0] || null,
      p_account_id: null,
    });
    if (error) throw error;
    const ga4PropertyId =ga4Properties?.accountSummaries?.[0]?.propertySummaries?.[0]?.property?.replace("properties/","") || null;
    console.log("GA4 PROPERTY CHOISIE:", ga4PropertyId);
    const gscSiteUrl = gscSites?.[0]?.siteUrl || null;
    console.log("GSC SITE CHOISI:", gscSiteUrl);
    const { data: updatedClient, error: clientUpdateError } =
      await supabaseAdmin
        .from("clients")
        .update({
          //google_ads_id: adsCustomers?.[0]?.replace("customers/", "") || null,
          ga4_property_id: ga4PropertyId,
          gsc_site_url: gscSiteUrl,
        })
        .eq("id", clientId)
        .select();

    console.log("CLIENT UPDATED:", updatedClient);
    console.log("UPDATE ERROR:", clientUpdateError);
    if (clientUpdateError) {
      console.error("Erreur mise à jour clients Meta:", clientUpdateError);
      // on ne bloque pas le redirect, les tokens sont déjà bien sauvegardés
    }
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
