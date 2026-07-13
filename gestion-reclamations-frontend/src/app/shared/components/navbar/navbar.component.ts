import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-shield-check text-primary me-2"></i>
          <strong>SOFIMA</strong>
          <span class="text-muted">Réclamations</span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="bi bi-speedometer2 me-1"></i>Tableau de bord
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/reclamations" routerLinkActive="active">
                <i class="bi bi-clipboard-check me-1"></i>Réclamations
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/reparations" routerLinkActive="active">
                <i class="bi bi-wrench me-1"></i>Réparations
              </a>
            </li>
          </ul>

          <div class="d-flex align-items-center">
            <div class="dropdown">
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button"
                      data-bs-toggle="dropdown">
                <i class="bi bi-person-circle me-1"></i>
                {{ user?.prenom }}
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" routerLink="/profil">Mon profil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" (click)="logout()">
                    <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-size: 1.1rem;
    }

    .nav-link.active {
      color: #0056b3 !important;
      font-weight: 500;
    }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);

  user = this.authService.getCurrentUser();

  logout() {
    this.authService.logout();
  }
}
