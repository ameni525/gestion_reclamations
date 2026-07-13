import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/components/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/auth/components/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/components/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'stats',
        canActivate: [roleGuard(['admin'])],
        loadComponent: () => import('./modules/dashboard/components/stats/stats.component').then(m => m.StatsComponent)
      },
      {
        path: 'utilisateurs',
        canActivate: [roleGuard(['admin'])],
        loadChildren: () => import('./modules/gestion-utilisateurs/gestion-utilisateurs.routes').then(m => m.UTILISATEURS_ROUTES)
      },
      {
        path: 'equipements',
        canActivate: [roleGuard(['admin', 'technicien'])],
        loadChildren: () => import('./modules/gestion-equipements/gestion-equipements.routes').then(m => m.EQUIPEMENTS_ROUTES)
      },
      {
        path: 'reclamations',
        canActivate: [roleGuard(['admin', 'technicien'])],
        loadChildren: () => import('./modules/gestion-reclamations/gestion-reclamations.routes').then(m => m.RECLAMATIONS_ROUTES)
      },
      {
        path: 'reparations',
        canActivate: [roleGuard(['admin', 'technicien'])],
        loadChildren: () => import('./modules/gestion-reparations/gestion-reparations.routes').then(m => m.REPARATIONS_ROUTES)
      },
      {
        path: 'profil',
        loadChildren: () => import('./modules/profil/profil.routes').then(m => m.PROFIL_ROUTES)
      }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
