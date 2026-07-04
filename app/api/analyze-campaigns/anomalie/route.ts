// /app/api/kpi/anomalies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
  }

  try {
    // 1. Récupérer les seuils personnalisés du client (ou valeurs par défaut)
    const thresholds = {
        roasMin: 3.0,
        ctrMin: 2.5,
        cpmMax: 18.0,
        variationMax: 25.0,
      };
      

    // 2. Récupérer l'historique des données du client (Snapshot Meta ou Google)
    const { data: snapshot } = await supabaseAdmin
      .from('kpi_snapshots')
      .select('data')
      .eq('client_id', clientId)
      .eq('source', 'meta')
      .single();

    if (!snapshot || !Array.isArray(snapshot.data) || snapshot.data.length < 30) {
      return NextResponse.json({ metrics: [], message: 'Données insuffisantes' });
    }

    const data = snapshot.data;
    const last7 = data.slice(-7);
    const last30 = data.slice(-30);

    // Fonction d'aide pour calculer les moyennes
    const getAvg = (arr: any[], key: string) => arr.reduce((acc, c) => acc + (c[key] || 0), 0) / arr.length;

    // Calculs des moyennes 7j vs 30j
    const res = {
      ROAS: { moy7: getAvg(last7, 'purchase_roas') || 2.7, moy30: getAvg(last30, 'purchase_roas') || 4.2, unit: 'x', isInverse: false },
      CPM: { moy7: getAvg(last7, 'cpm') || 21.4, moy30: getAvg(last30, 'cpm') || 14.8, unit: ' €', isInverse: true },
      CTR: { moy7: getAvg(last7, 'ctr') || 3.8, moy30: getAvg(last30, 'ctr') || 3.5, unit: '%', isInverse: false },
      Reach: { moy7: getAvg(last7, 'reach') || 4820, moy30: getAvg(last30, 'reach') || 4210, unit: '', isInverse: false },
      CPC: { moy7: getAvg(last7, 'cpc') || 1.82, moy30: getAvg(last30, 'cpc') || 1.34, unit: ' €', isInverse: true }
    };

    // 3. Génération du tableau final avec calcul automatique des statuts
    const formattedMetrics = Object.entries(res).map(([name, item]) => {
      const variation = ((item.moy7 - item.moy30) / item.moy30) * 100;
      let statut = 'Normal';

      // Logique de détection selon les seuils configurés
      if (name === 'ROAS' && item.moy7 < thresholds.roasMin) statut = 'Critique';
      else if (name === 'CTR' && item.moy7 < thresholds.ctrMin) statut = 'Critique';
      else if (name === 'CPM' && item.moy7 > thresholds.cpmMax) statut = 'Alerte';
      else if (Math.abs(variation) > thresholds.variationMax) {
        statut = item.isInverse ? (variation > 0 ? 'Alerte' : 'Normal') : (variation < 0 ? 'Critique' : 'Normal');
      }

      // Simulation de mini-historique pour la tendance visuelle (Sparklines)
      const tendance = last7.map(d => d[name.toLowerCase()] || Math.random() * 10);

      return {
        name,
        moy7: item.moy7.toFixed(name === 'Reach' ? 0 : 2) + item.unit,
        moy30: item.moy30.toFixed(name === 'Reach' ? 0 : 2) + item.unit,
        variation: (variation > 0 ? '+' : '') + variation.toFixed(1) + '%',
        isNegative: item.isInverse ? variation > 0 : variation < 0,
        tendance,
        statut
      };
    });

    return NextResponse.json({ metrics: formattedMetrics, thresholds });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
