"use client";

// app/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const searchParams = useSearchParams();

  const isVerify = searchParams.get("verify") === "1";
  const isError  = searchParams.get("error")  === "1";

  // ── Magic link via Resend ──────────────────────────────────
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", { email, redirect: false ,callbackUrl: "/dashboard"});
    setEmailSent(true);
    setLoading(false);
  }

  // ── Google OAuth ───────────────────────────────────────────
  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  // ── État : email envoyé ────────────────────────────────────
  if (emailSent || isVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-10 max-w-md w-full text-center space-y-4">
          <div className="text-4xl">📬</div>
          <h2 className="text-white text-xl font-semibold">Vérifiez votre email</h2>
          <p className="text-[#888] text-sm">
            Un lien de connexion a été envoyé à{" "}
            <span className="text-white font-medium">{email || "votre adresse"}</span>.
            <br />Cliquez dessus pour vous connecter.
          </p>
          <button
            onClick={() => { setEmailSent(false); setEmail(""); }}
            className="text-[#6C6FFF] text-sm underline underline-offset-2 hover:text-[#8B8EFF] transition-colors"
          >
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    );
  }

  // ── Page login principale ──────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#0F0F0F]">

      {/* ── Panneau gauche — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[#111] border-r border-[#1E1E1E]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6C6FFF] flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-white font-semibold text-lg">AgenceAI</span>
        </div>

        {/* Citation centrale */}
        <div className="space-y-6">
          <div className="w-12 h-1 bg-[#6C6FFF] rounded-full" />
          <blockquote className="text-[#DADADA] text-2xl font-light leading-relaxed">
            "Gérez vos clients, contenus et campagnes depuis un seul endroit."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#6C6FFF] font-bold text-sm">
              M
            </div>
            <div>
              <p className="text-white text-sm font-medium">Manager Agence</p>
              <p className="text-[#555] text-xs">AgenceAI Platform</p>
            </div>
          </div>
        </div>

        {/* Stats bas */}
        <div className="flex gap-8">
          {[
            { value: "2 400+", label: "Clients gérés" },
            { value: "98%",    label: "Satisfaction" },
            { value: "5 min",  label: "Onboarding" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-semibold text-lg">{s.value}</p>
              <p className="text-[#555] text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-white text-2xl font-semibold tracking-tight">
              Connexion
            </h1>
            <p className="text-[#666] text-sm">
              Accédez à votre espace agence
            </p>
          </div>

          {/* Erreur */}
          {isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
              Une erreur est survenue. Réessayez.
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#1A1A1A] hover:bg-[#222] border border-[#2A2A2A] hover:border-[#3A3A3A] text-white rounded-xl py-3 px-4 text-sm font-medium transition-all duration-150 disabled:opacity-50"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-[#444] text-xs">ou par email</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>

          {/* Magic link form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[#888] text-xs font-medium uppercase tracking-wider">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@agence.com"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#6C6FFF] focus:ring-1 focus:ring-[#6C6FFF]/30 rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] outline-none transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#6C6FFF] hover:bg-[#7B7EFF] active:bg-[#5A5DFF] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-semibold transition-all duration-150"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerIcon />
                  Envoi en cours…
                </span>
              ) : (
                "Envoyer le lien de connexion"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[#444] text-xs">
            En vous connectant vous acceptez nos{" "}
            <a href="/cgu" className="text-[#6C6FFF] hover:underline">
              conditions d'utilisation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Icônes inline ──────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}