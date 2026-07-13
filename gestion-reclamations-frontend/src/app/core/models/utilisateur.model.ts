export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  role_libelle: string;
  role_code?: string; 
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}
