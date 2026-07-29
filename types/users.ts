export interface Profile {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: "Collaborateur" | "Manager";
  created_at: string;
  poste: string | null;
  ville: string | null;
  pays: string | null;
}
export interface ProfileWithEmail extends Profile {
  email: string;
}
export interface Collaborateur {
  profiles: ProfileWithEmail;
  id: string;
  manager_id: string;
}

export interface CollaborateurFormData {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export interface Manager {
  id: string;
  nom_agence: string | null;
  adresse_agence: string| null;
  email_agence: string| null;
  fax_agence: string| null;
}
export interface PaginatedCollab {
  data: Collaborateur[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
export interface UpdateProfileInput {
  nom: string;
  prenom: string;
  telephone: string;
  poste?: string;
  ville?: string;
  pays?: string;

  nom_agence?: string;
  adresse_agence?: string;
  email_agence?: string;
  fax_agence?: string;
}
