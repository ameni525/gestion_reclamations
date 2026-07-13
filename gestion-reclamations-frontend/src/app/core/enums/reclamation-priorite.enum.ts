// src/app/core/enums/reclamation-priorite.enum.ts
export enum ReclamationPriorite {
  BASSE = 'basse',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  URGENTE = 'urgente'
}

export const PRIORITE_LABELS: Record<ReclamationPriorite, string> = {
  [ReclamationPriorite.BASSE]: 'Basse',
  [ReclamationPriorite.MOYENNE]: 'Moyenne',
  [ReclamationPriorite.HAUTE]: 'Haute',
  [ReclamationPriorite.URGENTE]: 'Urgente'
};

export const PRIORITE_COLORS: Record<ReclamationPriorite, string> = {
  [ReclamationPriorite.BASSE]: 'secondary',
  [ReclamationPriorite.MOYENNE]: 'primary',
  [ReclamationPriorite.HAUTE]: 'warning',
  [ReclamationPriorite.URGENTE]: 'danger'
};
