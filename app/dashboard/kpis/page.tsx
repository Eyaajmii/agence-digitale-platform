// app/dashboard/kpis/page.tsx
"use client";

import { Euro, Percent, TrendingUp, Eye, Users } from "lucide-react";

import { useKpiDashboard } from "@/hooks/Usekpidashboard";
import type { TrendDirection } from "@/types/kpiss";

import TopBar from "@/components/kpis//topbar";
import KpiCard from "@/components/kpis/kpiCard";
import SpendBarChart from "@/components/kpis/spentbarchart";
import CtrLineChart from "@/components/kpis/ctrlinechart";
import RadarChartProps from "@/components/kpis/radarChart";
import ThresholdsPanel from "@/components/kpis/Thresholdspanel";
import AnomaliesTable from "@/components/kpis/anomaliestable";
import AiAnalysisPanel from "@/components/kpis/aianalyse";

export default function KpisPage() {
  const {
    clients,
    selectedClient,
    periode,
    loading,
    loadingAi,
    metaData,
    aiAnalysis,
    anomaliesData,
    seuils,
    totalDepenses,
    avgCtr,
    currentRoas,
    totalReach,
    totalSessions,
    setPeriode,
    setSeuils,
    handleClientChange,
    handleGeneratePdf,
    loadKpiData,
  } = useKpiDashboard();

  const NO_DATA_TREND = { trendValue: "Pas encore de donnée", trendDirection: "flat" as TrendDirection };

  const statCards: Array<{
    icon: typeof Euro;
    label: string;
    value: string | number;
    trendValue: string;
    trendDirection: TrendDirection;
  }> = [
    {
      icon: Euro,
      label: "Dépenses",
      value: totalDepenses !== null ? `${totalDepenses.toLocaleString()} €` : "—",
      ...(totalDepenses !== null
        ? { trendValue: "Sur la période sélectionnée", trendDirection: "flat" as TrendDirection }
        : NO_DATA_TREND),
    },
    {
      icon: Percent,
      label: "CTR moyen",
      value: avgCtr !== null ? `${avgCtr}%` : "—",
      ...(avgCtr !== null
        ? { trendValue: "Sur la période sélectionnée", trendDirection: "flat" as TrendDirection }
        : NO_DATA_TREND),
    },
    {
      icon: TrendingUp,
      label: "ROAS",
      value: currentRoas !== null ? `${currentRoas}x` : "—",
      ...(currentRoas !== null
        ? { trendValue: "Dernière valeur connue", trendDirection: "flat" as TrendDirection }
        : NO_DATA_TREND),
    },
    {
      icon: Eye,
      label: "Reach",
      value:
        totalReach !== null
          ? totalReach >= 1000
            ? `${(totalReach / 1000).toFixed(0)} k`
            : totalReach
          : "—",
      ...(totalReach !== null
        ? { trendValue: "Sur la période sélectionnée", trendDirection: "flat" as TrendDirection }
        : NO_DATA_TREND),
    },
  ];

  return (
    <div className="space-y-6 font-[Inter,sans-serif]">
      <TopBar
        clients={clients}
        selectedClient={selectedClient}
        periode={periode}
        loading={loading}
        onClientChange={handleClientChange}
        onPeriodeChange={setPeriode}
        onGeneratePdf={handleGeneratePdf}
        onRefresh={() => loadKpiData(selectedClient, true)}
      />

      {loading ? (
        <div className="rounded-2xl border border-[#1A1720]/10 bg-white p-20 text-center font-medium text-[#6B6579]">
          Chargement des données KPI en cours...
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-[#1A1720]/10 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <KpiCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                trendValue={stat.trendValue}
                trendDirection={stat.trendDirection}
              />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SpendBarChart data={metaData} />
            <CtrLineChart data={metaData} />
          </div>

          {/* GA4 / GSC Cards */}
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#1A1720]/10 bg-[#1A1720]/10 sm:grid-cols-2">
            <KpiCard
              icon={Users}
              label="Sessions (GA4)"
              value={totalSessions !== null ? totalSessions.toLocaleString() : "—"}
              trendValue={
                totalSessions !== null
                  ? "Sur la période sélectionnée"
                  : "Pas encore de donnée"
              }
              trendDirection="flat"
            />
            <KpiCard
              icon={TrendingUp}
              label="Clicks Google (GSC)"
              value="—"
              trendValue="Search Console non connecté"
              trendDirection="flat"
            />
          </div>

          {/* Section Détection d'Anomalies */}
          <div className="space-y-6">
            <ThresholdsPanel seuils={seuils} onChange={setSeuils} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <AnomaliesTable data={anomaliesData} />
              </div>
              {/*<RadarChartProps
                  roas={parseFloat(currentRoas ?? "0")}
                  ctr={parseFloat(avgCtr ?? "0")}
                  seuils={seuils} anomalies={[]}              />*/}
            </div>
          </div>

          <AiAnalysisPanel loadingAi={loadingAi} aiAnalysis={aiAnalysis} />
        </>
      )}
    </div>
  );
}