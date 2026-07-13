// src/app/modules/gestion-equipements/gestion-equipements.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const EQUIPEMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/equipement-list/equipement-list.component')
      .then(m => m.EquipementListComponent)
  },
  {
    path: 'nouveau',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./components/equipement-form/equipement-form.component')
      .then(m => m.EquipementFormComponent)
  },
  {
    path: 'edit/:id',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./components/equipement-form/equipement-form.component')
      .then(m => m.EquipementFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/equipement-details/equipement-details.component')
      .then(m => m.EquipementDetailsComponent)
  }
];
