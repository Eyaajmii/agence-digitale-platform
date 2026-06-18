import { createClient } from "@supabase/supabase-js";
import type { Adapter, AdapterUser } from "next-auth/adapters";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const MinimalAdapter: Adapter = {
  async createVerificationToken(token) {
    const { error } = await supabase
      .from("verification_tokens")
      .insert({
        identifier: token.identifier,
        token:      token.token,
        expires:    token.expires,
      });
    if (error) console.error("createVerificationToken:", error);
    return token;
  },

  async useVerificationToken({ identifier, token }) {
    const { data } = await supabase
      .from("verification_tokens")
      .delete()
      .eq("identifier", identifier)
      .eq("token", token)
      .select()
      .single();
    return data ?? null;
  },

  async getUserByEmail(email): Promise<AdapterUser | null> {
    const { data: authData } = await supabase.auth.admin.listUsers();
    const authUser = authData?.users?.find(u => u.email === email);
    if (!authUser) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("nom, prenom")
      .eq("id", authUser.id)
      .single();

    return {
      id:            authUser.id,
      email:         authUser.email ?? email,
      name:          profile ? `${profile.nom} ${profile.prenom}` : null,
      emailVerified: authUser.email_confirmed_at
                     ? new Date(authUser.email_confirmed_at)
                     : null,
    };
  },

  async getUser(id): Promise<AdapterUser | null> {
    const { data: authData } = await supabase.auth.admin.getUserById(id);
    if (!authData?.user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("nom, prenom")
      .eq("id", id)
      .single();

    return {
      id,
      email:         authData.user.email ?? "",
      name:          profile ? `${profile.nom} ${profile.prenom}` : null,
      emailVerified: authData.user.email_confirmed_at
                     ? new Date(authData.user.email_confirmed_at)
                     : null,
    };
  },

  async createUser(user): Promise<AdapterUser> {
    return {
      id:            user.id,
      email:         user.email ?? "",
      name:          user.name  ?? null,
      emailVerified: user.emailVerified ?? null,
    };
  },

  async updateUser(user): Promise<AdapterUser> {
    return {
      id:            user.id!,
      email:         user.email ?? "",
      name:          user.name  ?? null,
      emailVerified: user.emailVerified ?? null,
    };
  },
  async getUserByAccount({ providerAccountId, provider }): Promise<AdapterUser | null> {
    // Cherche dans ta table "accounts" si elle existe
    // Sinon retourne null → NextAuth appellera createUser puis linkAccount
    const { data } = await supabase
      .from("accounts")
      .select("user_id")
      .eq("provider", provider)
      .eq("provider_account_id", providerAccountId)
      .single();
  
    if (!data?.user_id) return null;
  
    return MinimalAdapter.getUser!(data.user_id);
  },
  async linkAccount(account) {
    await supabase.from("accounts").upsert({
      user_id:             account.userId,
      provider:            account.provider,
      provider_account_id: account.providerAccountId,
    });
    return undefined;
  },
  async createSession(session)     { return session; },
  async getSessionAndUser()        { return null; },
  async updateSession()            { return undefined; },
  async deleteSession()            { return undefined; },
};