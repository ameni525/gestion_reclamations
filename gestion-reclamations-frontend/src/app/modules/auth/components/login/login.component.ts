import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-header text-center mb-4">
        <div class="logo mb-3">
          <img src="assets/images/sofima-logo.png" alt="SOFIMA Filters" class="logo-image">
        </div>
        <h2 class="h4">SOFIMA Réclamations</h2>
        <p class="text-muted">Gestion des réclamations et interventions</p>
      </div>

      <form #loginForm="ngForm" (ngSubmit)="onSubmit()" class="login-form">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" [(ngModel)]="credentials.email" name="email" required
                 placeholder="admin@sofima.tn">
        </div>

        <div class="mb-3">
          <label class="form-label">Mot de passe</label>
          <input type="password" class="form-control" [(ngModel)]="credentials.password" name="password" required
                 placeholder="••••••••">
        </div>

        <div class="d-grid gap-2 mb-3">
          <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading || !loginForm.valid">
            <span *ngIf="!loading">
              <i class="bi bi-box-arrow-in-right me-2"></i>Se connecter
            </span>
            <span *ngIf="loading">
              <span class="spinner-border spinner-border-sm me-2"></span>Connexion...
            </span>
          </button>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage">
          <i class="bi bi-exclamation-triangle me-2"></i>{{errorMessage}}
        </div>

        <div class="text-center mt-4">
          <p class="text-muted mb-0">
            <small>Version 1.0.0 • SOFIMA FILTERS © {{currentYear}}</small>
          </p>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      padding: 2rem;
    }
    .login-header {
      padding: 1rem;
    }
    .logo {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 80px;
    }
    .logo-image {
      max-height: 68px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(13, 110, 253, 0.25));
    }
    .login-form {
      max-width: 400px;
      margin: 0 auto;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: 'admin@sofima.tn',
    password: 'Admin@123'
  };

  loading = false;
  errorMessage = '';
  currentYear = new Date().getFullYear();

  onSubmit() {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials.email, this.credentials.password)
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            Swal.fire({
              icon: 'success',
              title: 'Connexion réussie!',
              text: `Bienvenue ${response.data.user?.prenom || ''} ${response.data.user?.nom || ''}`,
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/dashboard']);
            });
          } else {
            this.errorMessage = response.error || response.message || 'Erreur de connexion';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Erreur login:', error);
          this.loading = false;
          this.errorMessage = error.error?.error || error.message || 'Erreur de connexion';
          this.credentials.password = '';
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
