// /app/dashboard/kpis/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Euro,
  Percent,
  TrendingUp,
  Eye,
  FileText,
  Users,
} from "lucide-react";

import { createBrowserClient } from "@supabase/ssr";

interface Client {
  id: string;
  nom: string;
}

export default function KpisPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [periode, setPeriode] = useState<string>("30");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Data States
  const [metaData, setMetaData] = useState<any[]>([]);
  const [ga4Data, setGa4Data] = useState<any>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [anomaliesData, setAnomaliesData] = useState<any[]>([]);
  const [seuils, setSeuils] = useState({
    roasMin: 3.0,
    ctrMin: 2.5,
    cpmMax: 18,
    varMax: 25,
  });

  // ✅ Variables nécessaires pour l'API /api/report
  const [userEmail, setUserEmail] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");

  // 1. Load clients + session user on mount
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Récupération de l'email de l'utilisateur connecté
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
          setClientName(data[0].nom); // ✅ nom du premier client par défaut
        }
      });
  }, []);

  // 2. Fetcher AI Analysis
  const fetchAiAnalysis = async (clientId: string) => {
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
  };

  // 3. ✅ Fetcher Anomalies (correctement intégré)
  const loadAnomalies = async (clientId: string) => {
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
  };

  // 4. Fetcher principal KPIs
  const loadKpiData = async (clientId: string, forceRefresh = false) => {
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

      if (metaRes.ok) {
        const metaJson = await metaRes.json();
        setMetaData(Array.isArray(metaJson) ? metaJson : []);
      } else {
        setMetaData([]);
      }

      if (ga4Res.ok) {
        const ga4Json = await ga4Res.json();
        setGa4Data(ga4Json);
      } else {
        setGa4Data(null);
      }

      // ✅ loadAnomalies appelée ici, en parallèle avec l'AI
      await Promise.all([
        fetchAiAnalysis(clientId),
        loadAnomalies(clientId),
      ]);
    } catch (err) {
      console.error("Error fetching KPIs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      loadKpiData(selectedClient);
    }
  }, [selectedClient, periode]);

  // Calcul des totaux pour les Cards
  const totalDépenses = metaData.reduce(
    (acc, curr) => acc + (curr.spend || 0),
    0
  );
  const avgCtr =
    metaData.length > 0
      ? (
          metaData.reduce((acc, curr) => acc + (curr.ctr || 0), 0) /
          metaData.length
        ).toFixed(1)
      : "0.0";
  const currentRoas =
    metaData.length > 0
      ? (metaData[metaData.length - 1]?.purchase_roas || 4.2).toFixed(1)
      : "4.2";
  const totalReach =
    metaData.reduce((acc, curr) => acc + (curr.reach || 0), 0) || 128000;

  const handleGeneratePdf = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient, userEmail, clientName }),
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

  return (
    <div className="p-6 bg-[#f8f6f2] min-h-screen text-gray-800 w-full font-sans">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h1 className="text-xl font-bold text-gray-900">
            KPIs publicitaires
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClient}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedClient(id);
              // ✅ Synchronise le nom du client sélectionné pour le rapport PDF
              const found = clients.find((c) => c.id === id);
              if (found) setClientName(found.nom);
            }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-sm font-medium shadow-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="">Sélectionner un client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <div className="flex bg-white border border-gray-300 rounded-lg p-0.5 shadow-xs">
            {["7", "30", "90"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  periode === p
                    ? "bg-gray-100 text-gray-900 border border-gray-200"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {p} j
              </button>
            ))}
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? "Génération & Envoi..." : "📄 Générer Rapport PDF"}
          </button>

          <button
            onClick={() => loadKpiData(selectedClient, true)}
            disabled={loading}
            className="p-2 border border-gray-300 bg-white rounded-lg shadow-xs text-gray-500 hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-medium">
          Chargement des données KPI en cours...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1">
                <Euro className="w-4 h-4" /> <span>Dépenses</span>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {totalDépenses > 0
                  ? `${totalDépenses.toLocaleString()} €`
                  : "3 240 €"}
              </div>
              <div className="text-xs font-bold text-green-600 flex items-center gap-0.5">
                <span>↑ +12% vs mois passé</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1">
                <Percent className="w-4 h-4" /> <span>CTR moyen</span>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {avgCtr}%
              </div>
              <div className="text-xs font-bold text-green-600">↑ +0.4 pts</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1">
                <TrendingUp className="w-4 h-4" /> <span>ROAS</span>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {currentRoas}x
              </div>
              <div className="text-xs font-bold text-red-600">
                ↓ -0.3x vs mois passé
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1">
                <Eye className="w-4 h-4" /> <span>Reach</span>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {totalReach >= 1000
                  ? `${(totalReach / 1000).toFixed(0)} k`
                  : totalReach}
              </div>
              <div className="text-xs font-bold text-green-600">↑ +22%</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-gray-500" /> Dépenses
                quotidiennes (€)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      metaData.length > 0
                        ? metaData
                        : [
                            { name: "28", v: 4 },
                            { name: "29", v: 6 },
                            { name: "30", v: 5 },
                            { name: "1", v: 8 },
                          ]
                    }
                  >
                    <XAxis
                      dataKey="date_start"
                      stroke="#9ca3af"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip />
                    <Bar
                      dataKey="spend"
                      fill="#5c4ec3"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-gray-500" /> CTR — Meta vs
                Google
              </h3>
              <div className="h-64 w-full flex justify-center">
                {metaData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    Pas de données CTR disponibles
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={metaData}>
                      <XAxis
                        dataKey="date_start"
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="ctr"
                        name="Meta"
                        stroke="#5c4ec3"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="google_ctr"
                        name="Google"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* GA4 Sessions Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1">
              <Users className="w-4 h-4" /> <span>Sessions (GA4)</span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {ga4Data?.rows ? ga4Data.rows.length.toLocaleString() : "12.4 k"}
            </div>
            <div className="text-xs font-bold text-green-600">
              ↑ +8.5% vs mois passé
            </div>
          </div>

          {/* GSC Clicks Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1">
              <TrendingUp className="w-4 h-4" />{" "}
              <span>Clicks Google (GSC)</span>
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {metaData.length > 0 ? "3.4 k" : "3.4 k"}
            </div>
            <div className="text-xs font-bold text-green-600">↑ +14.2%</div>
          </div>

          {/* Section Détection d'Anomalies */}
          <div className="space-y-6 mt-8">
            {/* Seuils configurables */}
            <div className="bg-[#fffcf7] p-6 rounded-2xl border border-amber-100 shadow-xs">
              <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold text-sm">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <span>Seuils d'alerte configurables</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                    ROAS — seuil bas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={seuils.roasMin}
                      onChange={(e) =>
                        setSeuils({
                          ...seuils,
                          roasMin: parseFloat(e.target.value),
                        })
                      }
                      className="w-full text-xl font-black text-gray-900 border-b border-gray-300 focus:outline-none focus:border-gray-600 pb-1"
                    />
                    <span className="text-gray-400 font-bold text-sm">x</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Alerte
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">
                      Critique
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                    CTR — seuil bas
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={seuils.ctrMin}
                      onChange={(e) =>
                        setSeuils({
                          ...seuils,
                          ctrMin: parseFloat(e.target.value),
                        })
                      }
                      className="w-full text-xl font-black text-gray-900 border-b border-gray-300 focus:outline-none focus:border-gray-600 pb-1"
                    />
                    <span className="text-gray-400 font-bold text-sm">%</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Alerte
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-gray-400 border border-gray-200">
                      Critique
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                    CPM — seuil haut
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={seuils.cpmMax}
                      onChange={(e) =>
                        setSeuils({
                          ...seuils,
                          cpmMax: parseInt(e.target.value),
                        })
                      }
                      className="w-full text-xl font-black text-gray-900 border-b border-gray-300 focus:outline-none focus:border-gray-600 pb-1"
                    />
                    <span className="text-gray-400 font-bold text-sm">€</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-gray-400 border border-gray-200">
                      Alerte
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                      Critique
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                    Variation max / 7j
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={seuils.varMax}
                      onChange={(e) =>
                        setSeuils({
                          ...seuils,
                          varMax: parseInt(e.target.value),
                        })
                      }
                      className="w-full text-xl font-black text-gray-900 border-b border-gray-300 focus:outline-none focus:border-gray-600 pb-1"
                    />
                    <span className="text-gray-400 font-bold text-sm">%</span>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Alerte
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-gray-400 border border-gray-200">
                      Critique
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau Comparaison glissante */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
              <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-sm border-b border-gray-100 pb-3">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span>
                  Comparaison glissante — 7 derniers jours vs moyenne 30j
                </span>
              </div>

              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                    <th className="pb-3">Métrique</th>
                    <th className="pb-3">Moy. 7j</th>
                    <th className="pb-3">Moy. 30j</th>
                    <th className="pb-3">Variation</th>
                    <th className="pb-3 text-center">Tendance</th>
                    <th className="pb-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-800">
                  {anomaliesData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 flex items-center gap-2 font-bold text-gray-900">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            row.statut === "Critique"
                              ? "bg-red-500"
                              : row.statut === "Alerte"
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                        ></span>
                        {row.name}
                      </td>
                      <td className="py-4 font-bold text-gray-900">
                        {row.moy7}
                      </td>
                      <td className="py-4 text-gray-500">{row.moy30}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                            row.isNegative
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {row.variation}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center items-end gap-0.5 h-6">
                          {[4, 6, 5, 8, 7, 9, 10].map((h, idx) => (
                            <span
                              key={idx}
                              style={{ height: `${h * 2.3}px` }}
                              className={`w-1 rounded-t-xs ${
                                row.statut === "Critique"
                                  ? "bg-red-400"
                                  : row.statut === "Alerte"
                                  ? "bg-amber-400"
                                  : "bg-indigo-500"
                              }`}
                            ></span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs ${
                            row.statut === "Critique"
                              ? "text-red-600"
                              : row.statut === "Alerte"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {row.statut === "Critique" && "⚠️ Critique"}
                          {row.statut === "Alerte" && "🔔 Alerte"}
                          {row.statut === "Normal" && "✓ Normal"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loader IA */}
          {loadingAi && (
            <div className="bg-white p-5 rounded-2xl border border-purple-100 flex items-center gap-3 text-purple-700 font-medium text-sm shadow-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
              <span>
                Claude IA génère l'audit stratégique en arrière-plan...
              </span>
            </div>
          )}

          {/* Analyse IA */}
          {aiAnalysis && !loadingAi && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Analyse IA — Claude
                </h3>
                <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-md">
                  30 derniers jours
                </span>
              </div>

              <div className="space-y-3">
                {aiAnalysis.campagnes_a_risque?.map((cr: any, i: number) => (
                  <div
                    key={i}
                    className="bg-[#fef7ed] border border-[#fed7aa] rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-[#9a3412]"
                  >
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-[#ea580c]" />
                    <p className="font-medium">
                      <strong className="font-black text-[#7c2d12]">
                        {cr.nom}:{" "}
                      </strong>
                      {cr.raison} —{" "}
                      <span className="text-xs bg-orange-200 px-1.5 py-0.5 rounded-sm font-bold">
                        Métrique: {cr.metrique_critique}
                      </span>
                    </p>
                  </div>
                ))}

                {aiAnalysis.recommandations?.map((rec: any, i: number) => (
                  <div
                    key={i}
                    className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-[#166534]"
                  >
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[#16a34a]" />
                    <p className="font-medium">
                      <strong className="font-black text-[#14532d]">
                        Recommandation:{" "}
                      </strong>
                      {rec.action} —{" "}
                      <span className="text-gray-500 font-normal text-xs">
                        Impact attendu: {rec.impact_attendu} (Priorité{" "}
                        {rec.priorite})
                      </span>
                    </p>
                  </div>
                ))}

                {aiAnalysis.anomalies?.map((an: any, i: number) => (
                  <div
                    key={i}
                    className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-3.5 flex items-start gap-2.5 text-sm text-[#991b1b]"
                  >
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-[#dc2626]" />
                    <p className="font-medium">
                      <span className="inline-block text-[10px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded-xs mr-1.5">
                        {an.importance}
                      </span>
                      <strong className="font-black text-[#7f1d1d]">
                        Anomalie:{" "}
                      </strong>
                      {an.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}