// app/dashboard/page.tsx

export default function DashboardPage() {
    return (
      <div className="space-y-8 max-w-5xl">
  
        {/* ── Titre ── */}
        <div>
          <h1 className="text-2xl font-semibold text-[#0F0F1A] tracking-tight">
            Vue d'ensemble
          </h1>
          <p className="text-sm text-[#9B9CB8] mt-1">
            Bienvenue sur votre tableau de bord AgenceAI
          </p>
        </div>
  
        {/* ── Cartes KPI ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Clients actifs",     value: "24",     sub: "+3 ce mois",   color: "#6C6FFF" },
            { label: "Contenus générés",   value: "148",    sub: "+12 ce mois",  color: "#22C55E" },
            { label: "Campagnes AEO",      value: "9",      sub: "En cours",     color: "#F59E0B" },
            { label: "Collaborateurs",     value: "6",      sub: "Actifs",       color: "#EC4899" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-[#E8E9F0] p-5 space-y-3"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${card.color}18` }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: card.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F0F1A]">{card.value}</p>
                <p className="text-xs text-[#9B9CB8] mt-0.5">{card.label}</p>
              </div>
              <p className="text-xs font-medium" style={{ color: card.color }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>
  
        {/* ── Clients récents ── */}
        <div className="bg-white rounded-xl border border-[#E8E9F0]">
          <div className="px-6 py-4 border-b border-[#E8E9F0] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F0F1A]">Clients récents</h2>
            <a href="/dashboard/clients" className="text-xs text-[#6C6FFF] hover:underline font-medium">
              Voir tout
            </a>
          </div>
          <div className="divide-y divide-[#E8E9F0]">
            {[
              { nom: "Société Alpha",   secteur: "E-commerce",   collab: "Yasmine B.",  statut: "Actif" },
              { nom: "Beta Services",   secteur: "Finance",       collab: "Karim M.",    statut: "Actif" },
              { nom: "Gamma Tech",      secteur: "Technologie",   collab: "Sarra L.",    statut: "En attente" },
              { nom: "Delta Group",     secteur: "Immobilier",    collab: "Ahmed T.",    statut: "Actif" },
            ].map((client) => (
              <div key={client.nom} className="px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0F0FF] flex items-center justify-center">
                    <span className="text-[#6C6FFF] text-xs font-bold">
                      {client.nom[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F0F1A]">{client.nom}</p>
                    <p className="text-xs text-[#9B9CB8]">{client.secteur}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="text-xs text-[#5C5E7A] hidden sm:block">{client.collab}</p>
                  <span className={`
                    text-xs font-medium px-2.5 py-1 rounded-full
                    ${client.statut === "Actif"
                      ? "bg-green-50 text-green-600"
                      : "bg-amber-50 text-amber-600"
                    }
                  `}>
                    {client.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* ── Activité récente ── */}
        <div className="bg-white rounded-xl border border-[#E8E9F0]">
          <div className="px-6 py-4 border-b border-[#E8E9F0]">
            <h2 className="text-sm font-semibold text-[#0F0F1A]">Activité récente</h2>
          </div>
          <div className="divide-y divide-[#E8E9F0]">
            {[
              { action: "Contenu généré pour",  cible: "Société Alpha",  temps: "Il y a 5 min",   color: "#6C6FFF" },
              { action: "Nouveau client créé :", cible: "Gamma Tech",     temps: "Il y a 1h",      color: "#22C55E" },
              { action: "Campagne AEO lancée :", cible: "Beta Services",  temps: "Il y a 3h",      color: "#F59E0B" },
              { action: "KPI mis à jour pour",   cible: "Delta Group",    temps: "Hier",           color: "#EC4899" },
            ].map((item, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <p className="text-sm text-[#5C5E7A]">
                    {item.action}{" "}
                    <span className="font-medium text-[#0F0F1A]">{item.cible}</span>
                  </p>
                </div>
                <p className="text-xs text-[#9B9CB8] whitespace-nowrap">{item.temps}</p>
              </div>
            ))}
          </div>
        </div>
  
      </div>
    );
  }