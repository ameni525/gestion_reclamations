import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'stats', loadComponent: () => import('./components/stats/stats.component').then(m => m.StatsComponent) }
];
