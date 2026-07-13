export interface Reparation {
  id: number;
  reclamation_id: number;
  date_reparation: string;
  technicien_id: number;
  duree_intervention: number | null;
  actions: string;
  pieces_utilisees: string | null;
  cout_estime: number | string | null;
  statut: string;
  created_at?: string;


  reclamation_numero?: string;
  reclamation_description?: string;
  technicien_nom?: string;
  equipement_nom?: string; 
  equipement_reference?: string; 
}
