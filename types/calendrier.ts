export interface CalendrierEvent {
    id: string
    client_id: string
    contenu_id: string
    date: string
    statut: 'planifié' | 'publié' | 'annulé'
    created_at: string
    // joins
    contenus?: {
      texte: string
      plateforme: string
      statut: string
      objective:string
    }
    clients?: {
      nom: string
    }
  }