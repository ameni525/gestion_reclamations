import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="unauthorized-container">
      <div class="text-center">
        <div class="mb-4">
          <i class="bi bi-shield-lock text-danger" style="font-size: 5rem;"></i>
        </div>
        <h1 class="h2 mb-3">Accès non autorisé</h1>
        <p class="lead text-muted mb-4">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-primary" routerLink="/dashboard">
            <i class="bi bi-house-door me-2"></i>Tableau de bord
          </button>
          <button class="btn btn-outline-danger" (click)="logout()">
            <i class="bi bi-box-arrow-right me-2"></i>Changer d'utilisateur
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    }
  `]
})
export class UnauthorizedComponent {
  logout() {
    localStorage.removeItem('sofima_token');
    localStorage.removeItem('sofima_user');
    window.location.href = '/auth/login';
  }
}
