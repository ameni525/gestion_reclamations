export interface Reclamation {
  id: number;
  numero: string;
  date_reclamation: string;
  type: string;
  description: string;
  equipement_id: number;
  delai_souhaite: string | null;
  contact_client: string | null;
  statut: string;
  priorite: string;
  created_by: number;
  assigned_technicien_id: number | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;


  equipement_nom?: string;
  equipement_reference?: string; 
  createur_nom?: string;
  technicien_nom?: string;
  nb_reparations?: number;
}
