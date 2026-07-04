export type ImpactLevel = "eleve" | "moyen" | "faible";

export interface AeoRecommendation {
  impact: ImpactLevel;
  texte: string;
}

export interface AeoDetailsScore {
  clarte_definitions: number;
  donnees_chiffrees: number;
  structure_faq: number;
  entites_nommees: number;
  autorite_sources: number;
}

export interface AeoAudit {
  id: string;
  client_id: string;
  url: string;
  score_aeo: number;
  details_score: AeoDetailsScore;
  recommandations: AeoRecommendation[];
  created_at: string;
  updated_at: string;
}

export type MoteurIA = "perplexity" | "chatgpt" | "gemini" | "claude";
export type StatutCitation = "cite" | "position" | "non_cite";

export interface AeoMonitoringRow {
  id: string;
  client_id: string;
  requete: string;
  moteur_ia: MoteurIA;
  domaine_cible: string;
  domaine_cite: boolean;
  position: number | null;
  statut: StatutCitation;
  derniere_verif: string;
  evolution: string | null;
}

export interface GenerateAeoContentInput {
  clientId: string;
  sujet: string;
  angle: string;
  publicCible: string;
}