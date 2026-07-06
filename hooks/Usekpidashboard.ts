// hooks/useKpiDashboard.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  ClientOption,
  Seuils,
  AnomalieRow,
  AiAnalysis,
  MetaDailyRow,
} from "@/types/kpiss"
import { GA4KpiData } from "@/types/kpi";

const DEFAULT_SEUILS: Seuils = {
  roasMin: 3.0,
  ctrMin: 2.5,
  cpmMax: 18,
  varMax: 25,
};

export function useKpiDashboard() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [periode, setPeriode] = useState<string>("30");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const [metaData, setMetaData] = useState<MetaDailyRow[]>([]);
  const [ga4Data, setGa4Data] = useState<GA4KpiData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [anomaliesData, setAnomaliesData] = useState<AnomalieRow[]>([]);
  const [seuils, setSeuils] = useState<Seuils>(DEFAULT_SEUILS);

  const [userEmail, setUserEmail] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");

  // 1. Charger les clients + l'utilisateur connecté
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    });

    supabase
      .from("clients")
      .select("id, nom")
      .order("nom")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setClients(data);
          setSelectedClient(data[0].id);
          setClientName(data[0].nom);
        }
      });
  }, []);

  // 2. Analyse IA
  const fetchAiAnalysis = useCallback(async (clientId: string) => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/analyze-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (err) {
      console.error("Error with AI Analysis:", err);
    } finally {
      setLoadingAi(false);
    }
  }, []);

  // 3. Anomalies
  const loadAnomalies = useCallback(async (clientId: string) => {
    try {
      const res = await fetch(
        `/api/analyze-campaigns/anomalie?clientId=${clientId}`
      );
      if (res.ok) {
        const data = await res.json();
        setAnomaliesData(data.metrics || []);
        if (data.thresholds) {
          setSeuils({
            roasMin: data.thresholds.roasMin,
            ctrMin: data.thresholds.ctrMin,
            cpmMax: data.thresholds.cpmMax,
            varMax: data.thresholds.variationMax,
          });
        }
      }
    } catch (err) {
      console.error("Erreur anomalies fetch:", err);
    }
  }, []);

  // 4. KPIs principaux
  const loadKpiData = useCallback(
    async (clientId: string, forceRefresh = false) => {
      if (!clientId) return;
      setLoading(true);
      setAiAnalysis(null);
      try {
        const refreshParam = forceRefresh ? "&refresh=true" : "";
        const [metaRes, ga4Res] = await Promise.all([
          fetch(
            `/api/kpi/meta?clientId=${clientId}&periode=${periode}${refreshParam}`
          ),
          fetch(
            `/api/kpi/ga4?clientId=${clientId}&periode=${periode}${refreshParam}`
          ),
        ]);

        setMetaData(metaRes.ok ? await metaRes.json().then((j) => (Array.isArray(j) ? j : [])) : []);
        setGa4Data(ga4Res.ok ? await ga4Res.json() : null);

        await Promise.all([fetchAiAnalysis(clientId), loadAnomalies(clientId)]);
      } catch (err) {
        console.error("Error fetching KPIs:", err);
      } finally {
        setLoading(false);
      }
    },
    [periode, fetchAiAnalysis, loadAnomalies]
  );

  useEffect(() => {
    if (selectedClient) {
      loadKpiData(selectedClient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, periode]);

  const handleClientChange = (id: string) => {
    setSelectedClient(id);
    const found = clients.find((c) => c.id === id);
    if (found) setClientName(found.nom);
  };

  const handleGeneratePdf = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          userEmail,
          clientName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Le rapport PDF a été envoyé sur votre boîte mail !");
      } else {
        alert(`Erreur: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Totaux dérivés pour les cards — `null` = pas de donnée réelle, à afficher comme "—"
  const hasMetaData = metaData.length > 0;

  const totalDepenses = hasMetaData
    ? metaData.reduce((acc, curr) => acc + (curr.spend || 0), 0)
    : null;

  const avgCtr = hasMetaData
    ? (
        metaData.reduce((acc, curr) => acc + (curr.ctr || 0), 0) /
        metaData.length
      ).toFixed(1)
    : null;

  const lastRoas = hasMetaData
    ? metaData[metaData.length - 1]?.purchase_roas
    : undefined;
  const currentRoas =
    hasMetaData && typeof lastRoas === "number" ? lastRoas.toFixed(1) : null;

  const totalReach = hasMetaData
    ? metaData.reduce((acc, curr) => acc + (curr.reach || 0), 0)
    : null;

  const totalSessions =
    ga4Data?.rows && ga4Data.rows.length > 0 ? ga4Data.rows.length : null;

  return {
    // state
    clients,
    selectedClient,
    periode,
    loading,
    loadingAi,
    metaData,
    ga4Data,
    aiAnalysis,
    anomaliesData,
    seuils,
    // dérivés
    totalDepenses,
    avgCtr,
    currentRoas,
    totalReach,
    totalSessions,
    // setters / actions
    setPeriode,
    setSeuils,
    handleClientChange,
    handleGeneratePdf,
    loadKpiData,
  };
}