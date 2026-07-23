"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

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
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          ✓
        </div>

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
    <div className="min-h-screen bg-slate-50 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-200 blur-3xl opacity-40" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-200 blur-3xl opacity-40" />
      </div>
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
            <span className="font-bold text-sm">LD</span>
          </div>

          <h2 className="font-semibold text-slate-900">Lezarts Digital</h2>

          <p className="text-xs text-slate-500">Marketing Platform</p>
        </div>
      </div>
      {/* ── Panneau droit — formulaire ── */}
      <div className="min-h-screen flex items-center justify-center px-6">
        <div
          className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-8
          shadow-xl
          shadow-slate-200/50
          "
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2"></div>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-900">Bienvenue</h1>

              <p className="mt-2 text-sm text-slate-500">
                Connectez-vous à votre espace.
              </p>
            </div>
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
            className="
w-full
h-12
rounded-xl
border
border-slate-300
bg-white
text-slate-700
font-medium
hover:border-slate-400
hover:bg-slate-50
transition-all
flex
items-center
justify-center
gap-3
"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="h-px flex-1 bg-slate-200" />
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
                className="
w-full
rounded-xl
border
border-slate-300
bg-slate-50
px-4
py-3
text-sm
outline-none
focus:border-blue-500
focus:ring-4
focus:ring-blue-100
transition-all
"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="
w-full
h-12
rounded-xl
bg-slate-900
text-white
font-medium
hover:bg-blue-800
transition-all
disabled:opacity-50
"
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
