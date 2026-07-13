// src/app/modules/gestion-utilisateurs/gestion-utilisateurs.routes.ts
import { Routes } from '@angular/router';

export const UTILISATEURS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/utilisateur-list/utilisateur-list.component')
      .then(m => m.UtilisateurListComponent)
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./components/utilisateur-form/utilisateur-form.component')
      .then(m => m.UtilisateurFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/utilisateur-form/utilisateur-form.component')
      .then(m => m.UtilisateurFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/utilisateur-details/utilisateur-details.component')
      .then(m => m.UtilisateurDetailsComponent)
  }
];
