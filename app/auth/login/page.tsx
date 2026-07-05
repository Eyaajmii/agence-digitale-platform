"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function Waveform() {
  const bars = [4, 9, 6, 12, 5, 8, 3, 10, 6];
  return (
    <div className="flex items-end gap-[3px] h-4">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[#FF3D7F]/50"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const searchParams = useSearchParams();

  const isVerify = searchParams.get("verify") === "1";
  const isError = searchParams.get("error") === "1";

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("resend", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setEmailSent(true);
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  // ── État : email envoyé ────────────────────────────────────
  if (emailSent || isVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0B14] relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF3D7F]/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#6C4CFF]/10 blur-3xl rounded-full" />

        <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-5 backdrop-blur-xl">
          <div className="flex justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3D7F] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF3D7F]" />
            </span>
          </div>
          <h2 className="font-[Space_Grotesk,sans-serif] text-white text-xl font-bold tracking-tight">
            Vérifiez votre email
          </h2>
          <p className="text-[#9C96B5] text-sm leading-relaxed">
            Un lien de connexion a été envoyé à{" "}
            <span className="text-white font-medium">
              {email || "votre adresse"}
            </span>
            .
            <br />
            Cliquez dessus pour vous connecter.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#9C96B5]/60 font-[IBM_Plex_Mono,monospace]">
            En attente du signal
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail("");
            }}
            className="text-[#FF3D7F] text-sm underline underline-offset-4 hover:text-[#FF6B9C] transition-colors"
          >
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    );
  }

  // ── Page login principale ──────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#0D0B14]">
      {/* ── Panneau gauche — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden border-r border-white/10">
        <div className="absolute -top-10 -left-16 w-72 h-72 bg-[#FF3D7F]/15 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#6C4CFF]/15 blur-3xl rounded-full" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FF3D7F] flex items-center justify-center">
            <span className="text-[#0D0B14] font-[Space_Grotesk,sans-serif] font-bold">
              L
            </span>
          </div>
          <div>
            <h2 className="font-[Space_Grotesk,sans-serif] font-bold text-white text-lg tracking-tight">
              Lezarts Digital
            </h2>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
              Digital Marketing Studio
            </p>
          </div>
        </div>

        {/* Citation centrale */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="max-w-lg text-center space-y-6">
            <div className="w-12 h-1 bg-[#FF3D7F] rounded-full mx-auto" />
            <blockquote className="font-[Space_Grotesk,sans-serif] text-[#EDEBF5] text-3xl font-light leading-relaxed">
              Gérez vos clients, contenus et campagnes depuis un seul endroit.
            </blockquote>
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ── */}
      <div className="flex flex-1 items-center justify-center p-6 relative">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3D7F] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF3D7F]" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#FF3D7F] font-[IBM_Plex_Mono,monospace] font-semibold">
                Connexion sécurisée
              </span>
            </div>
            <h1 className="font-[Space_Grotesk,sans-serif] text-white text-2xl font-bold tracking-tight">
              Connexion
            </h1>
            <p className="text-[#9C96B5] text-sm">
              Accédez à votre espace agence
            </p>
          </div>

          {/* Erreur */}
          {isError && (
            <div className="bg-[#FF3D7F]/10 border border-[#FF3D7F]/30 rounded-lg px-4 py-3 text-[#FF6B9C] text-sm">
              Une erreur est survenue. Réessayez.
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white rounded-xl py-3 px-4 text-sm font-medium transition-all duration-150 disabled:opacity-50"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#9C96B5]/60 text-[10px] uppercase tracking-widest font-[IBM_Plex_Mono,monospace]">
              ou par email
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Magic link form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[#9C96B5] text-[10px] font-medium uppercase tracking-[0.15em] font-[IBM_Plex_Mono,monospace]">
                Adresse email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@agence.com"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-[#FF3D7F] focus:ring-1 focus:ring-[#FF3D7F]/30 rounded-xl px-4 py-3 text-white text-sm placeholder-[#9C96B5]/40 outline-none transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#FF3D7F] hover:bg-[#FF5A90] active:bg-[#E62E6C] disabled:opacity-40 disabled:cursor-not-allowed text-[#0D0B14] rounded-xl py-3 text-sm font-bold transition-all duration-150"
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
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D0B14]" />}>
      <LoginContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}
