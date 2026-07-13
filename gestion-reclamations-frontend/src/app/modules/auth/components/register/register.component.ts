import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="text-center py-5">
      <i class="bi bi-person-plus fs-1 text-muted"></i>
      <h3 class="mt-3">Inscription</h3>
      <p class="text-muted">Pour créer un compte, contactez l'administrateur.</p>
      <button class="btn btn-outline-primary" routerLink="/auth/login">
        <i class="bi bi-arrow-left me-2"></i>Retour à la connexion
      </button>
    </div>
  `,
  styles: []
})
export class RegisterComponent {}
