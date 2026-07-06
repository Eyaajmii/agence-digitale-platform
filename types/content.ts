export type Platform = 'Twitter' | 'Instagram' | 'Facebook' | 'Linkedin' | 'GoogleAds' | 'TikTok'
export type ContentStatus = 'Brouillon' | 'Publié' | 'Approuvé' 

export interface Contenu {
  id: string
  client_id: string
  plateforme: Platform
  statut: ContentStatus
  texte: string
  objective:string
  variantes: string[] | null
  created_at: string
  updated_at?: string
}

export interface GenerateRequest {
  clientId: string
  platform: Platform
  objective: string
}

export interface GenerateCompleteEvent {
  variants: string[]
  contentId: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
  model: string
}

export type SSEEvent =
  | { type: 'start'; message: string; platform: string; clientId: string }
  | { type: 'delta'; text: string }
  | { type: 'complete'; variants: string[]; contentId: string | null; usage?: GenerateCompleteEvent['usage']; model?: string }
  | { type: 'error'; message: string }

export const PLATFORM_LABELS: Record<Platform, string> = {
  Twitter: 'Twitter',
  Instagram: 'Instagram',
  Facebook: 'Facebook',
  Linkedin: 'LinkedIn',
  GoogleAds: 'Google Ads',
  TikTok:'TikTok'
}

export const OBJECTIVE_OPTIONS = [
  'Notoriété de marque',
  'Engagement communautaire',
  'Génération de leads',
  'Promotion produit / offre',
  'Lancement de produit',
  'Événement',
  'Recrutement',
  'Contenu éducatif',
]