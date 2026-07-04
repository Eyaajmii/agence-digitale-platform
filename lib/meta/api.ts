export const META_SCOPES = ["ads_read", "business_management"];
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

  if (!response.ok) {
    throw new Error("Erreur récupération token Meta");
  }

  return response.json();
}
