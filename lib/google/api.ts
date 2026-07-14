export function getGoogleAuthUrl(clientId: string) {
  const params = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/adwords",
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ].join(" "),
    state: clientId,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForToken(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });
  const text = await response.text();

  console.log("Google token response:", text);

  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Google a retourné du HTML: ${text.substring(0, 300)}`);
  }

  if (!response.ok) {
    throw new Error(
      data.error_description ||
      data.error ||
      "Erreur récupération token Google"
    );
  }

  return data;
}
export async function refreshGoogleToken(refreshToken: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Erreur Google token exchange:", data);
    throw new Error(
      data.error_description || data.error || "Erreur récupération token Google"
    );
  }

  return data;
}
export async function listGoogleAdsCustomers(accessToken: string) {
  const response = await fetch(
    "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
      },
    }
  );

  const text = await response.text();

  console.log("Google Ads status:", response.status);
  console.log("Google Ads response:", text);

  if (!response.ok) {
    throw new Error(`Google Ads API Error ${response.status}`);
  }

  const data = JSON.parse(text);
  return data.resourceNames ?? [];
}
export async function listGA4Properties(accessToken: string) {
  const response = await fetch(
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const text = await response.text();

  console.log("GA4 STATUS:", response.status);
  console.log("GA4 RESPONSE:", text);

  if (!response.ok) {
    throw new Error(`GA4 Error ${response.status}`);
  }

  return JSON.parse(text);
}
export async function listSearchConsoleSites(
  accessToken: string
) {
  const response = await fetch(
    "https://www.googleapis.com/webmasters/v3/sites",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  return data.siteEntry ?? [];
}