import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar">
      <div class="sidebar-header p-3 border-bottom">
        <div class="d-flex align-items-center">
          <img src="assets/images/sofima-logo.png" alt="SOFIMA Filters" class="sidebar-logo me-2">
          <div>
            <div class="fw-bold">SOFIMA</div>
            <small class="text-muted">Filters</small>
          </div>
        </div>
      </div>

      <div class="sidebar-body p-3">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
              <i class="bi bi-speedometer2 me-2"></i>Tableau de bord
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" routerLink="/reclamations" routerLinkActive="active">
              <i class="bi bi-clipboard-check me-2"></i>Réclamations
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" routerLink="/reparations" routerLinkActive="active">
              <i class="bi bi-wrench me-2"></i>Réparations
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" routerLink="/equipements" routerLinkActive="active" *ngIf="isAdmin || isTechnicien">
              <i class="bi bi-tools me-2"></i>Équipements
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" routerLink="/utilisateurs" routerLinkActive="active" *ngIf="isAdmin">
              <i class="bi bi-people me-2"></i>Utilisateurs
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" routerLink="/stats" routerLinkActive="active" *ngIf="isAdmin">
              <i class="bi bi-bar-chart me-2"></i>Statistiques
            </a>
          </li>

          <li class="nav-item mt-4">
            <a class="nav-link" routerLink="/profil">
              <i class="bi bi-person-circle me-2"></i>Mon profil
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-footer p-3 border-top">
        <div class="user-info">
          <small class="d-block fw-bold">{{ user?.prenom }} {{ user?.nom }}</small>
          <small class="text-muted d-block">{{ user?.role_libelle }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      z-index: 1000;
      padding-top: 60px;
    }
    .sidebar-header {
      background: white;
      position: fixed;
      top: 0;
      left: 0;
      width: 250px;
      height: 60px;
      z-index: 1001;
    }
    .sidebar-logo {
      width: 34px;
      height: 34px;
      object-fit: contain;
    }
    .sidebar-body {
      overflow-y: auto;
      height: calc(100vh - 120px);
    }
    .sidebar-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 250px;
      background: white;
    }
    .nav-link {
      color: #495057;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      margin-bottom: 0.25rem;
    }
    .nav-link:hover {
      background-color: #e9ecef;
      color: #0056b3;
    }
    .nav-link.active {
      background-color: #0056b3;
      color: white;
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  user = this.authService.getCurrentUser();
  isAdmin = this.authService.isAdmin();
  isTechnicien = this.authService.isTechnicien();
}
