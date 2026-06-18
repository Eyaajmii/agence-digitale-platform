export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          nom: string;
          prenom: string;
          telephone: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          nom: string;
          secteur: string;
          ton:string;
          mots_interdits: string[] | null;
          exemples: Json | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["clients"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      contenus: {
        Row: {
            id: string;
            client_id: string;
            platforme: string;
            objective: string;
            text: string;
            variantes:  Json | null;
            statut: string;
            created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["contenus"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["contenus"]["Insert"]>;
      };
      calendrier: {
        Row: {
          id: string;
          client_id: string;
          content_id: string;
          date: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["calendrier"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["calendrier"]["Insert"]>;
      };
    };
  };
}
