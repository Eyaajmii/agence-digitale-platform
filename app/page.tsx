import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PenSquare, BarChart3, Search } from "lucide-react";

export const metadata = {
  title: "Lezarts Digital Hub",
  description:
    "Plateforme interne de Lezarts Digital pour la génération de contenu IA, le suivi des KPIs publicitaires et l'optimisation pour les moteurs de recherche IA.",
};

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

const features = [
  {
    icon: PenSquare,
    title: "Génération de contenu IA",
    desc: "Rédaction assistée de copies publicitaires adaptées à chaque client, avec calendrier éditorial intégré.",
  },
  {
    icon: BarChart3,
    title: "Suivi des KPIs publicitaires",
    desc: "Centralisation des données Google Ads, Meta Ads, Google Analytics et Search Console pour un pilotage précis des campagnes.",
  },
  {
    icon: Search,
    title: "Optimisation IA (AEO)",
    desc: "Analyse et optimisation du contenu pour améliorer sa visibilité dans les réponses des moteurs de recherche IA.",
  },
];

export default async function Home() {
  const session = await auth();

  // Utilisateur déjà connecté → on le redirige directement, comportement inchangé
  if (session) {
    redirect("/dashboard");
  }

  // Visiteur non connecté (y compris les robots Google) → page explicative
  return (
    <div className="min-h-screen bg-[#0D0B14] relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF3D7F]/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#6C4CFF]/10 blur-3xl rounded-full" />

      <header className="relative flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#FF3D7F] flex items-center justify-center">
            <span className="text-[#0D0B14] font-[Space_Grotesk,sans-serif] font-bold">
              L
            </span>
          </div>
          <div>
            <h2 className="font-[Space_Grotesk,sans-serif] font-bold text-white text-lg tracking-tight">
              Lezarts Digital Hub
            </h2>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#9C96B5] font-[IBM_Plex_Mono,monospace]">
              Digital Marketing Studio
            </p>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="bg-[#FF3D7F] hover:bg-[#FF5A90] text-[#0D0B14] rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-150"
        >
          Se connecter
        </Link>
      </header>

      <main className="relative px-8 py-20 max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3D7F] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF3D7F]" />
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#FF3D7F] font-[IBM_Plex_Mono,monospace] font-semibold">
            Plateforme interne
          </span>
        </div>

        <h1 className="font-[Space_Grotesk,sans-serif] text-white text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Le studio digital de Lezarts Digital
        </h1>

        <p className="text-[#9C96B5] text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Lezarts Digital Hub est l&apos;outil interne de notre agence : il
          centralise la génération de contenu IA, le suivi des KPIs
          publicitaires de nos clients et l&apos;optimisation de leur
          visibilité sur les moteurs de recherche IA (ChatGPT, Perplexity,
          Gemini).
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <Link
            href="/auth/login"
            className="bg-[#FF3D7F] hover:bg-[#FF5A90] text-[#0D0B14] rounded-xl px-6 py-3 text-sm font-bold transition-all duration-150"
          >
            Continuer avec Google
          </Link>
          <Link
            href="/privacy-policy"
            className="border border-white/10 hover:border-white/20 text-white rounded-xl px-6 py-3 text-sm font-medium transition-all duration-150"
          >
            Politique de confidentialité
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="w-10 h-10 rounded-lg bg-[#6C4CFF]/20 flex items-center justify-center mb-4">
                <Icon size={18} className="text-[#6C4CFF]" strokeWidth={2.2} />
              </div>
              <h3 className="font-[Space_Grotesk,sans-serif] text-white font-semibold mb-2">
                {title}
              </h3>
              <p className="text-[#9C96B5] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-[#9C96B5]/60 text-xs mt-16 font-[IBM_Plex_Mono,monospace]">
          Accès réservé à l&apos;agence Lezarts Digital et à ses clients
          autorisés.
        </p>
      </main>

      <footer className="relative border-t border-white/10 px-8 py-6 flex items-center justify-between">
        <Waveform />
        <p className="text-[#9C96B5]/60 text-[10px] uppercase tracking-widest font-[IBM_Plex_Mono,monospace]">
          © {new Date().getFullYear()} Lezarts Digital
        </p>
      </footer>
    </div>
  );
}