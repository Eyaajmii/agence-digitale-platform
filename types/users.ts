export interface Profile {
    id: string
    nom: string
    prenom: string
    telephone: string
    role: 'Collaborateur' | 'Manager'
    created_at: string
  }
  export interface ProfileWithEmail extends Profile {
    email: string
  }
  export interface Collaborateur {
    profiles: ProfileWithEmail
    id: string
    manager_id: string;
  }
  
  export interface CollaborateurFormData {
    nom: string
    prenom: string
    telephone: string
    email:string
  }
  
  export interface Manager {
    id: string
    nom_agence: string
    adresse_agence: string
    email_agence: string
    fax_agence: string
  }