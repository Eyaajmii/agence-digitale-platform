import { auth } from "@/auth";
import { createBrowserClient } from "@supabase/ssr";
import {
  Users,
  FileText,
  Target,
  UserCog,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ---------- Types ----------
type Trend = { value: string; direction: "up" | "down" | "flat" };

function computeTrend(current: number, previous: number): Trend {
  if (previous === 0 && current === 0)
    return { value: "Stable", direction: "flat" };
  if (previous === 0) return { value: `+${current} ce mois`, direction: "up" };
  const diff = current - previous;
  if (diff === 0) return { value: "Stable", direction: "flat" };
  return {
    value: `${diff > 0 ? "+" : ""}${diff} ce mois`,
    direction: diff > 0 ? "up" : "down",
  };
}

function monthRange(offset = 0) {
  const start = new Date();
  start.setMonth(start.getMonth() - offset, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  const role = session?.user?.role; // "Manager" | "Collaborateur"

  if (!userId) {
    return (
      <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-10 text-center text-slate-500 font-[Inter,sans-serif]">
        Session introuvable — reconnecte-toi.
      </div>
    );
  }

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const isManager = role === "Manager";

  // ---------- 1. Scope clients ----------
  const clientsBase = supabase.from("clients").select("*");
  const { data: allClients } = isManager
    ? await clientsBase.eq("manager_id", userId)
    : await clientsBase.eq("collaborateur_id", userId);

  const clients = allClients ?? [];
  const clientIds = clients.map((c) => c.id);
  const hasClients = clientIds.length > 0;

  const thisMonth = monthRange(0);
  const lastMonth = monthRange(1);
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  // ---------- 2. Requêtes parallèles ----------
  const [
    contenusThisMonth,
    contenusLastMonth,
    auditsThisMonth,
    auditsLastMonth,
    collaborateursCount,
    kpiRecents,
    contenusRecents,
    auditsRecents,
  ] = hasClients
    ? await Promise.all([
        supabase
          .from("contenus")
          .select("*", { count: "exact", head: true })
          .in("client_id", clientIds)
          .gte("created_at", thisMonth.start.toISOString()),
        supabase
          .from("contenus")
          .select("*", { count: "exact", head: true })
          .in("client_id", clientIds)
          .gte("created_at", lastMonth.start.toISOString())
          .lt("created_at", lastMonth.end.toISOString()),
        supabase
          .from("audit_aeo")
          .select("*", { count: "exact", head: true })
          .in("client_id", clientIds)
          .gte("created_at", thisMonth.start.toISOString()),
        supabase
          .from("audit_aeo")
          .select("*", { count: "exact", head: true })
          .in("client_id", clientIds)
          .gte("created_at", lastMonth.start.toISOString())
          .lt("created_at", lastMonth.end.toISOString()),
        isManager
          ? supabase
              .from("collaborateurs")
              .select("*", { count: "exact", head: true })
              .eq("manager_id", userId)
          : Promise.resolve({ count: null }),
        supabase
          .from("kpi_snapshots")
          .select("client_id, data, created_at")
          .in("client_id", clientIds)
          .gte("created_at", last30.toISOString()),
        supabase
          .from("contenus")
          .select("id, client_id, created_at, plateforme")
          .in("client_id", clientIds)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("audit_aeo")
          .select("id, client_id, created_at, url")
          .in("client_id", clientIds)
          .order("created_at", { ascending: false })
          .limit(5),
      ])
    : [
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { data: [] },
        { data: [] },
        { data: [] },
      ];

  // ---------- 3. Statut réel des clients (actif si KPI < 30j) ----------
  const clientsAvecKpiRecent = new Set(
    (kpiRecents.data ?? []).map((k: any) => k.client_id)
  );

  // ---------- 4. Noms des collaborateurs (via profiles) ----------
  const collaborateurIds = Array.from(
    new Set(clients.map((c) => c.collaborateur_id).filter(Boolean))
  );
  const { data: collabProfiles } = collaborateurIds.length
    ? await supabase
        .from("profiles")
        .select("id, nom, prenom")
        .in("id", collaborateurIds)
    : { data: [] };
  const collabNameById = new Map(
    (collabProfiles ?? []).map((p: any) => [
      p.id,
      `${p.prenom ?? ""} ${p.nom ?? ""}`.trim(),
    ])
  );

  // ---------- 5. Clients récents (triés par création) ----------
  const clientsRecents = [...clients]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  // ---------- 6. Fil d'activité réel (fusion contenus + audits) ----------
  const clientNameById = new Map(clients.map((c) => [c.id, c.nom]));
  const activityFeed = [
    ...(contenusRecents.data ?? []).map((c: any) => ({
      action: "Contenu généré pour",
      cible: clientNameById.get(c.client_id) ?? "Client",
      date: c.created_at,
    })),
    ...(auditsRecents.data ?? []).map((a: any) => ({
      action: "Audit AEO lancé pour",
      cible: clientNameById.get(a.client_id) ?? "Client",
      date: a.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // ---------- 7. Performance agrégée (depuis kpi_snapshots.data — adapte les clés à ta structure réelle) ----------
  let totalSpend = 0,
    totalClicks = 0,
    totalImpressions = 0,
    totalConversions = 0,
    ctrSum = 0,
    ctrCount = 0;
  for (const snap of kpiRecents.data ?? []) {
    const d = (snap as any).data as Record<string, any> | null;
    if (!d) continue;
    totalSpend += Number(d.spend ?? d.cost ?? 0) || 0;
    totalClicks += Number(d.clicks ?? 0) || 0;
    totalImpressions += Number(d.impressions ?? 0) || 0;
    totalConversions += Number(d.conversions ?? 0) || 0;
    if (typeof d.ctr === "number") {
      ctrSum += d.ctr;
      ctrCount += 1;
    }
  }
  const engagementRate = ctrCount > 0 ? (ctrSum / ctrCount) * 100 : null;

  const trendContenus = computeTrend(
    contenusThisMonth.count ?? 0,
    contenusLastMonth.count ?? 0
  );
  const trendAudits = computeTrend(
    auditsThisMonth.count ?? 0,
    auditsLastMonth.count ?? 0
  );

  const stats = [
    {
      label: "Clients actifs",
      value: String(clients.length),
      trend: { value: "Total portefeuille", direction: "flat" as const },
      icon: Users,
    },
    {
      label: "Contenus générés",
      value: String(contenusThisMonth.count ?? 0),
      trend: trendContenus,
      icon: FileText,
    },
    {
      label: "Audits AEO",
      value: String(auditsThisMonth.count ?? 0),
      trend: trendAudits,
      icon: Target,
    },
    {
      label: "Collaborateurs",
      value: String(collaborateursCount.count ?? 0),
      trend: { value: "Actifs", direction: "flat" as const },
      icon: UserCog,
      onlyManager: true,
    },
  ];

  return (
    <div className="space-y-6 font-[Inter,sans-serif]">
      {!hasClients ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-500">
            Aucun client rattaché à ton compte pour le moment.
          </p>
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-[#1A1720]/10 sm:grid-cols-2 xl:grid-cols-4">
            {stats
              .filter((s) => !s.onlyManager || isManager)
              .map((stat) => {
                const Icon = stat.icon;
                const TrendIcon =
                  stat.trend.direction === "up"
                    ? ArrowUpRight
                    : stat.trend.direction === "down"
                    ? ArrowDownRight
                    : Minus;
                const trendColor =
                  stat.trend.direction === "up"
                    ? "text-emerald-600"
                    : stat.trend.direction === "down"
                    ? "text-red-500"
                    : "text-slate-400";
                return (
                  <div
                    key={stat.label}
                    className="
bg-white
rounded-xl
border
border-slate-200
p-6
shadow-sm
hover:shadow-md
transition-all
duration-200
"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </span>
                      <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-3 text-3xl font-semibold font-bold tabular-nums text-slate-900">
                      {stat.value}
                    </p>
                    <p
                      className={`mt-2 flex items-center gap-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${trendColor}`}
                    >
                      <TrendIcon className="h-3.5 w-3.5" />
                      {stat.trend.value}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* CLIENTS + ACTIVITÉ */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* CLIENTS */}
            <div className="overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-white xl:col-span-2">
              <div className="flex items-center justify-between border-b border-[#1A1720]/10 px-6 py-4">
                <h2 className="text-sm font-semibold font-semibold text-slate-900">
                  Clients récents
                </h2>
                <a
                  href="/dashboard/clients"
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:text-[#e02f6c]"
                >
                  Voir tout
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1A1720]/10 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-[IBM_Plex_Mono,monospace]">
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Secteur</th>
                    <th className="hidden px-6 py-3 font-medium md:table-cell">
                      Collaborateur
                    </th>
                    <th className="px-6 py-3 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1720]/5">
                  {clientsRecents.map((client) => {
                    const actif = client.statut === "actif";
                    return (
                      <tr key={client.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold font-semibold">
                              {client.nom?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span className="font-medium text-slate-900">
                              {client.nom}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {client.secteur ?? "—"}
                        </td>
                        <td className="hidden px-6 py-4 text-slate-500 md:table-cell">
                          {collabNameById.get(client.collaborateur_id) || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-[IBM_Plex_Mono,monospace] ${
                              actif
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                actif ? "bg-emerald-500" : "bg-[#9C96B5]"
                              }`}
                            />
                            {actif ? "Actif" : "En attente"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ACTIVITÉ */}
            <div className="rounded-2xl border border-[#1A1720]/10 bg-white">
              <div className="border-b border-[#1A1720]/10 px-6 py-4">
                <h2 className="text-sm font-semibold font-semibold text-slate-900">
                  Activité récente
                </h2>
              </div>
              <div className="space-y-5 p-6">
                {activityFeed.length > 0 ? (
                  activityFeed.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                      <div>
                        <p className="text-sm text-slate-500">
                          {item.action}{" "}
                          <span className="font-medium text-slate-900">
                            {item.cible}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400 font-[IBM_Plex_Mono,monospace]">
                          {new Date(item.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    Aucune activité récente.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PERFORMANCE */}
          <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-6">
            <h2 className="text-sm font-semibold font-semibold text-slate-900">
              Performance générale
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Agrégée sur les 30 derniers jours, toutes plateformes connectées.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[#1A1720]/10 bg-[#1A1720]/10 md:grid-cols-3">
              <div className="bg-slate-50 p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 font-[IBM_Plex_Mono,monospace]">
                  Taux d'engagement (CTR)
                </p>
                <p className="mt-2 text-2xl font-semibold font-bold tabular-nums text-slate-900">
                  {engagementRate !== null
                    ? `${engagementRate.toFixed(1)}%`
                    : "—"}
                </p>
              </div>
              <div className="bg-slate-50 p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 font-[IBM_Plex_Mono,monospace]">
                  Conversions
                </p>
                <p className="mt-2 text-2xl font-semibold font-bold tabular-nums text-slate-900">
                  {totalConversions || "—"}
                </p>
              </div>
              <div className="bg-slate-50 p-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 font-[IBM_Plex_Mono,monospace]">
                  Dépenses (30j)
                </p>
                <p className="mt-2 text-2xl font-semibold font-bold tabular-nums text-slate-900">
                  {totalSpend ? `${totalSpend.toLocaleString("fr-FR")} €` : "—"}
                </p>
              </div>
            </div>
            {totalImpressions === 0 && totalClicks === 0 && (
              <p className="mt-4 text-xs text-[#9C96B5]">
                Aucune donnée KPI trouvée — connecte Meta Ads / Google Ads pour
                peupler ce bloc.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
