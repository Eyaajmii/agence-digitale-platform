export const SECTOR_OPTIONS = [
  'E-commerce',
  'Immobilier',
  'Restauration',
  'Mode & Beauté',
  'Tech & SaaS',
  'Santé & Bien-être',
  'Finance',
  'Éducation',
  'Tourisme',
  'Sport',
  'Autre',
] as const
export type ClientSecteur = typeof SECTOR_OPTIONS[number]
export const TON_OPTIONS = [
  'professionnel',
  'decontracte',
  'humoristique',
  'inspirant',
  'educatif',
  'luxe',
] as const

export type ClientTon = typeof TON_OPTIONS[number]
export type Platforme = 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok'

export const PLATFORM_LIMITS: Record<Platforme, number> = {
  twitter:   280,
  instagram: 2200,
  facebook:  500,
  linkedin:  700,
  tiktok:    300,
}

export const PLATFORM_LABELS: Record<Platforme, string> = {
  twitter:   'Twitter / X',
  instagram: 'Instagram',
  facebook:  'Facebook',
  linkedin:  'LinkedIn',
  tiktok:    'TikTok',
}

export interface Exemple {
  platforme:    Platforme
  text:         string
  performance?: 'bon' | 'excellent'
}
export interface Client {
  id:                string              
  nom:               string              
  secteur:           ClientSecteur | null 
  ton:               ClientTon | null     
  mots_interdits:    string[] | null      
  exemples:          Exemple[] | null
  email:string | null
  statut:string | null    
  created_at:        string | null       
  manager_id:        string | null        
  collaborateur_id:  string | null
  collaborateurs?: {
    id: string
    profiles: {
      nom: string
      prenom: string
    }
  }     
}

export interface ClientFormData {
  statut: string
  nom:            string
  secteur:        ClientSecteur
  ton:            ClientTon
  mots_interdits: string     
  exemples:       Exemple[]
  email:string
  collaborateur_id:string
}
export interface PaginatedClients {
  data:        Client[]
  total:       number
  page:        number
  per_page:    number
  total_pages: number
}