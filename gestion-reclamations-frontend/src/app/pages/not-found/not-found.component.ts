// src/app/pages/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="text-center">
        <h1 class="display-1 text-muted">404</h1>
        <h2 class="mb-4">Page non trouvée</h2>
        <p class="lead text-muted mb-4">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div class="d-flex justify-content-center gap-3">
          <button class="btn btn-primary" routerLink="/dashboard">
            <i class="bi bi-house-door me-2"></i>Retour au tableau de bord
          </button>
          <button class="btn btn-outline-secondary" routerLink="/auth/login">
            <i class="bi bi-box-arrow-in-right me-2"></i>Se connecter
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .display-1 {
      font-size: 8rem;
      font-weight: 300;
      line-height: 1;
    }
  `]
})
export class NotFoundComponent {}
