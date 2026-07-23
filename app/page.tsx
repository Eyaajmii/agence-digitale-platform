import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PenSquare, BarChart3, Search } from "lucide-react";

export const metadata = {
  title: "Lezarts Digital Hub",
  description:
    "Plateforme interne de Lezarts Digital pour la génération de contenu IA, le suivi des KPIs publicitaires et l'optimisation pour les moteurs de recherche IA.",
};



export default async function Home() {
  const session = await auth();

  // Utilisateur déjà connecté → on le redirige directement, comportement inchangé
  if (session) {
    redirect("/dashboard");
  }

  // Visiteur non connecté (y compris les robots Google) → page explicative
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {" "}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF3D7F]/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#6C4CFF]/10 blur-3xl rounded-full" />
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md">
            <span className="font-bold text-sm">LD</span>
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Lezarts Digital</h2>

            <p className="text-xs text-slate-500">Marketing Platform</p>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
        >
          Connexion
        </Link>
      </header>
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-medium text-blue-700">
    Plateforme interne Lezarts Digital
  </span>

  <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
    Gérez vos contenus, campagnes et performances marketing
  </h1>

  <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
    Une plateforme centralisée pour la génération de contenu IA,
    le suivi des performances publicitaires et la gestion des clients.
  </p>

  <div className="mt-10 flex justify-center gap-4">
    <Link
      href="/auth/login"
      className="rounded-xl bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-800 transition"
    >
      Accéder à la plateforme
    </Link>

    <Link
      href="/privacy-policy"
      className="rounded-xl border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-50 transition"
    >
      Confidentialité
    </Link>
  </div>
</section>
<footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
  © {new Date().getFullYear()} Lezarts Digital
</footer>
    </div>
  );
}
