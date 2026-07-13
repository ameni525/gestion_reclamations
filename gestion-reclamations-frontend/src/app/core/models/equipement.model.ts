export interface Equipement {
  id: number;
  nom: string;
  categorie: string;
  reference: string;
  atelier: string;
  ligne_production: string;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}
