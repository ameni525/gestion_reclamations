import { Routes } from '@angular/router';

export const PROFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/mon-profil/mon-profil.component')
      .then(m => m.MonProfilComponent)
  },
  {
    path: 'changer-mot-de-passe',
    loadComponent: () => import('./components/changer-mot-de-passe/changer-mot-de-passe.component')
      .then(m => m.ChangerMotDePasseComponent)
  }
];
