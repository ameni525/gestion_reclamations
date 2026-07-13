import { Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-changer-mot-de-passe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="bi bi-key me-2"></i>
                Changer le mot de passe
              </h4>
            </div>
            <div class="card-body">
              <div class="alert alert-info" *ngIf="!backendSupportsChangePassword">
                <i class="bi bi-info-circle me-2"></i>
                Changement de mot de passe non supporté par l'API backend actuelle.
              </div>

              <form #passwordForm="ngForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Mot de passe actuel *</label>
                  <input type="password" class="form-control"
                         [(ngModel)]="passwordData.current_password"
                         name="current_password" required>
                </div>

                <div class="mb-3">
                  <label class="form-label">Nouveau mot de passe *</label>
                  <input type="password" class="form-control"
                         [(ngModel)]="passwordData.new_password"
                         name="new_password" required minlength="8">
                  <small class="text-muted">Minimum 8 caractères</small>
                </div>

                <div class="mb-3">
                  <label class="form-label">Confirmer le nouveau mot de passe *</label>
                  <input type="password" class="form-control"
                         [(ngModel)]="passwordData.confirm_password"
                         name="confirm_password" required>
                </div>

                <div class="alert alert-warning" *ngIf="passwordsMismatch">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  Les nouveaux mots de passe ne correspondent pas
                </div>

                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary" routerLink="/profil">
                    <i class="bi bi-arrow-left me-2"></i>Annuler
                  </button>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="!passwordForm.valid || loading || passwordsMismatch || !backendSupportsChangePassword">
                    <span *ngIf="!loading">
                      <i class="bi bi-check-circle me-2"></i>
                      Changer le mot de passe
                    </span>
                    <span *ngIf="loading">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      En cours...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChangerMotDePasseComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = false;
  backendSupportsChangePassword = true;

  passwordData = {
    current_password: '',
    new_password: '',
    confirm_password: ''
  };

  get passwordsMismatch(): boolean {
    return this.passwordData.new_password !== this.passwordData.confirm_password &&
           this.passwordData.confirm_password !== '';
  }

  onSubmit() {
    if (this.loading || this.passwordsMismatch) return;

    this.loading = true;

    this.authService.changePassword({
      current_password: this.passwordData.current_password,
      new_password: this.passwordData.new_password
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.backendSupportsChangePassword = true;
        Swal.fire({
          icon: 'success',
          title: 'Mot de passe changé',
          text: response.message || 'Votre mot de passe a été modifié avec succès.',
          confirmButtonColor: '#0056b3'
        }).then(() => {
          this.router.navigate(['/profil']);
        });
      },
      error: (error: unknown) => {
        this.loading = false;

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.backendSupportsChangePassword = false;
          Swal.fire({
            icon: 'info',
            title: 'Fonction non disponible',
            text: 'Le backend actuel ne fournit pas encore le changement de mot de passe.',
            confirmButtonColor: '#0d6efd'
          });
          return;
        }

        const message =
          error instanceof HttpErrorResponse
            ? (error.error?.error || error.error?.message || 'Erreur lors du changement du mot de passe.')
            : 'Erreur lors du changement du mot de passe.';

        Swal.fire({
          icon: 'error',
          title: 'Échec',
          text: message,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
