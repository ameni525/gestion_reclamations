import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const RECLAMATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/reclamation-list/reclamation-list.component')
      .then(m => m.ReclamationListComponent)
  },
  {
    path: 'nouvelle',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./components/reclamation-form/reclamation-form.component')
      .then(m => m.ReclamationFormComponent)
  },
  {
    path: 'edit/:id',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./components/reclamation-form/reclamation-form.component')
      .then(m => m.ReclamationFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/reclamation-details/reclamation-details.component')
      .then(m => m.ReclamationDetailsComponent)
  }
];
