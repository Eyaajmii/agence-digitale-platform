import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { createClient } from "@supabase/supabase-js";
import { MinimalAdapter } from "@/lib/adapter";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MinimalAdapter,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: process.env.NODE_ENV === "production"
        ? process.env.EMAIL_FROM ?? "noreply@votre-agence.com"
        : "onboarding@resend.dev",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  callbacks: {
    /*authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) {
        return isLoggedIn;
      }
      if (nextUrl.pathname === "/login" && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },*/
    async signIn({ user, account }) {
      if (!user?.email) return false;
    
      // Pour Resend (magic link) → laisser passer, l'adapter gère tout
      if (account?.provider === "resend") return true;
    
      // Pour Google → vérifier que l'user existe dans Supabase
      if (account?.provider === "google") {
        const { data } = await supabase.auth.admin.listUsers();
        const authUser = data?.users?.find(u => u.email === user.email);
        if (!authUser) return "/auth/login?error=unauthorized";
    
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", authUser.id)
          .single();
    
        return !!profile;
      }
    
      return false;
    },

    async redirect({ url, baseUrl }) {
      if (url.includes("/api/auth")) return url;
      if (url === baseUrl || url === `${baseUrl}/`) return `${baseUrl}/dashboard`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const { data: authData } = await supabase.auth.admin.listUsers();
        const authUser = authData?.users?.find(u => u.email === user.email);

        if (authUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, nom, prenom")
            .eq("id", authUser.id)
            .single();

          token.role   = profile?.role   ?? null;
          token.nom    = profile?.nom    ?? null;
          token.prenom = profile?.prenom ?? null;
          token.sub    = authUser.id;
        }
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id     = token.sub!;
        session.user.role   = token.role   as string;
      }
      return session;
    },
  },
  
});
