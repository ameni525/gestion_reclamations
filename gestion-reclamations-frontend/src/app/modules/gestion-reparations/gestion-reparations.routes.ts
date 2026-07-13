// src/app/modules/gestion-reparations/gestion-reparations.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const REPARATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/reparation-list/reparation-list.component')
      .then(m => m.ReparationListComponent)
  },
  {
    path: 'nouvelle',
    canActivate: [roleGuard(['admin', 'technicien'])],
    loadComponent: () => import('./components/reparation-form/reparation-form.component')
      .then(m => m.ReparationFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/reparation-details/reparation-details.component')
      .then(m => m.ReparationDetailsComponent)
  }
];
