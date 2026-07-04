// app/dashboard/page.tsx

import {
  Users,
  FileText,
  Target,
  UserCog,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      label: "Clients actifs",
      value: "24",
      sub: "+3 ce mois",
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Contenus générés",
      value: "148",
      sub: "+12 ce mois",
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Campagnes AEO",
      value: "9",
      sub: "En cours",
      icon: Target,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Collaborateurs",
      value: "6",
      sub: "Actifs",
      icon: UserCog,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
  ];

  const clients = [
    {
      nom: "Société Alpha",
      secteur: "E-commerce",
      collaborateur: "Yasmine B.",
      statut: "Actif",
    },
    {
      nom: "Beta Services",
      secteur: "Finance",
      collaborateur: "Karim M.",
      statut: "Actif",
    },
    {
      nom: "Gamma Tech",
      secteur: "Technologie",
      collaborateur: "Sarra L.",
      statut: "En attente",
    },
    {
      nom: "Delta Group",
      secteur: "Immobilier",
      collaborateur: "Ahmed T.",
      statut: "Actif",
    },
  ];

  const activities = [
    {
      action: "Contenu généré pour",
      cible: "Société Alpha",
      temps: "Il y a 5 min",
    },
    {
      action: "Nouveau client créé",
      cible: "Gamma Tech",
      temps: "Il y a 1h",
    },
    {
      action: "Campagne AEO lancée",
      cible: "Beta Services",
      temps: "Il y a 3h",
    },
    {
      action: "KPI mis à jour pour",
      cible: "Delta Group",
      temps: "Hier",
    },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Bienvenue sur votre plateforme de gestion AgenceAI.
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              <div
                className={`
                  ${stat.bg}
                  w-14 h-14
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                `}
              >
                <Icon className={`h-7 w-7 ${stat.color}`} />
              </div>

              <div className="mt-5">
                <h3 className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {stat.label}
                </p>
              </div>

              <p className={`mt-4 text-sm font-semibold ${stat.color}`}>
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* CLIENTS + ACTIVITÉ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* CLIENTS */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Clients récents
            </h2>

            <a
              href="/dashboard/clients"
              className="
                flex
                items-center
                gap-1
                text-sm
                font-medium
                text-orange-500
                hover:text-orange-600
              "
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="divide-y divide-slate-100">
            {clients.map((client) => (
              <div
                key={client.nom}
                className="
                  flex
                  items-center
                  justify-between
                  px-6
                  py-4
                  hover:bg-slate-50
                  transition
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-orange-100
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <span className="font-bold text-orange-600">
                      {client.nom.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium text-slate-900">
                      {client.nom}
                    </p>

                    <p className="text-sm text-slate-500">
                      {client.secteur}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="hidden md:block text-sm text-slate-500">
                    {client.collaborateur}
                  </span>

                  <span
                    className={
                      client.statut === "Actif"
                        ? `
                          px-3 py-1
                          rounded-full
                          bg-emerald-100
                          text-emerald-700
                          text-xs
                          font-semibold
                        `
                        : `
                          px-3 py-1
                          rounded-full
                          bg-orange-100
                          text-orange-700
                          text-xs
                          font-semibold
                        `
                    }
                  >
                    {client.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVITÉS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">
              Activité récente
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4"
              >
                <div className="w-3 h-3 rounded-full bg-orange-500 mt-2" />

                <div className="flex-1">
                  <p className="text-sm text-slate-600">
                    {activity.action}{" "}
                    <span className="font-semibold text-slate-900">
                      {activity.cible}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {activity.temps}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOC ANALYTICS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Performance générale
        </h2>

        <p className="mt-2 text-slate-500">
          Vue rapide des performances de votre agence digitale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Taux d'engagement
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              84%
            </h3>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              Leads générés
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              127
            </h3>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">
              ROI moyen
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              +215%
            </h3>
          </div>

        </div>
      </div>

    </div>
  );
}