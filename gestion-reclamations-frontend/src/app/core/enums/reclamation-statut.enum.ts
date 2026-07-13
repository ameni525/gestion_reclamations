export enum ReclamationStatut {
  EN_ATTENTE = 'en_attente',
  EN_COURS = 'en_cours',
  TRAITEE = 'traitee',
  ANNULEE = 'annulee'
}

export const STATUT_LABELS: Record<ReclamationStatut, string> = {
  [ReclamationStatut.EN_ATTENTE]: 'En attente',
  [ReclamationStatut.EN_COURS]: 'En cours',
  [ReclamationStatut.TRAITEE]: 'Traitée',
  [ReclamationStatut.ANNULEE]: 'Annulée'
};

export const STATUT_COLORS: Record<ReclamationStatut, string> = {
  [ReclamationStatut.EN_ATTENTE]: 'warning',
  [ReclamationStatut.EN_COURS]: 'info',
  [ReclamationStatut.TRAITEE]: 'success',
  [ReclamationStatut.ANNULEE]: 'danger'
};
