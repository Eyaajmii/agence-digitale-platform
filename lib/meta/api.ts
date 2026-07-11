export const META_SCOPES = [
  "ads_read",
  "business_management",
  "pages_show_list",
  "pages_read_engagement",
];
export function getMetaAuthUrl(clientId: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    response_type: "code",
    scope: META_SCOPES.join(","),
    state: clientId,
  });

  return `https://www.facebook.com/v23.0/dialog/oauth?${params.toString()}`;
}

export async function exchangeMetaCodeForToken(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/v23.0/oauth/access_token?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur meta token exchange:", data);
    throw new Error(
      data.error_description || data.error || "Erreur récupération token meta"
    );
  }

  return data;
}
// Récupère les comptes publicitaires (Ad Accounts) accessibles avec ce token
export async function listMetaAdAccounts(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v23.0/me/adaccounts?fields=id,name,account_status,currency,business&access_token=${accessToken}`
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Meta listAdAccounts:", data);
    throw new Error(data.error?.message || "Erreur récupération comptes publicitaires Meta");
  }

  return data.data as {
    id: string; // ex: "act_1234567890"
    name: string;
    account_status: number;
    currency: string;
    business?: { id: string; name: string };
  }[];
}

// Récupère les Business Manager accessibles (utile si le client gère plusieurs entités)
export async function listMetaBusinesses(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v23.0/me/businesses?fields=id,name,verification_status&access_token=${accessToken}`
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Meta listBusinesses:", data);
    throw new Error(data.error?.message || "Erreur récupération Business Manager Meta");
  }

  return data.data as { id: string; name: string; verification_status: string }[];
}

// Récupère les Pages Facebook + comptes Instagram Business liés (utile pour l'ID Instagram)
export async function listMetaPages(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${accessToken}`
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Meta listPages:", data);
    throw new Error(data.error?.message || "Erreur récupération pages Meta");
  }

  return data.data as {
    id: string; // page_id
    name: string;
    access_token: string; // page access token, différent du user token
    instagram_business_account?: { id: string; username: string };
  }[];
}
export async function exchangeMetaLongLivedToken(shortLivedToken: string) {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(
    `https://graph.facebook.com/v23.0/oauth/access_token?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Meta long-lived token:", data);
    throw new Error(data.error?.message || "Erreur génération token longue durée Meta");
  }

  return data as { access_token: string; token_type: string; expires_in: number };
}