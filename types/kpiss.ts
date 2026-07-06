// components/kpis/types.ts

// Le sélecteur de client ne charge que id + nom (pas le Client complet de @/types/client
// qui exige secteur, ton, mots_interdits, etc.) — on utilise donc ce type dédié et léger.
export interface ClientOption {
    id: string;
    nom: string;
  }
  export type TrendDirection = "up" | "down" | "flat";

  export interface Seuils {
    roasMin: number;
    ctrMin: number;
    cpmMax: number;
    varMax: number;
  }
  
  export interface AnomalieRow {
    name: string;
    moy7: string | number;
    moy30: string | number;
    variation: string;
    isNegative: boolean;
    statut: "Critique" | "Alerte" | "Normal";
  }
  
  export interface CampagneARisque {
    nom: string;
    raison: string;
    metrique_critique: string;
  }
  
  export interface Recommandation {
    action: string;
    impact_attendu: string;
    priorite: string | number;
  }
  
  export interface AnomalieIA {
    importance: string;
    description: string;
  }
  
  export interface AiAnalysis {
    campagnes_a_risque?: CampagneARisque[];
    recommandations?: Recommandation[];
    anomalies?: AnomalieIA[];
  }
  
  // Forme agrégée par jour renvoyée par /api/kpi/meta pour les graphiques.
  // Différente de `MetaKpiData` (types/kpis.ts), qui décrit un snapshot brut unique.
  export interface MetaDailyRow {
    date_start: string;
    spend: number;
    ctr: number;
    google_ctr?: number;
    reach?: number;
    purchase_roas?: number;
  }