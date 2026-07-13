// src/app/modules/profil/components/mon-profil/mon-profil.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="profil-container">
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              <div class="avatar-circle bg-primary mb-3">
                {{ userInitials }}
              </div>
              <h5 class="card-title">{{ user?.prenom }} {{ user?.nom }}</h5>
              <p class="card-text text-muted">{{ user?.role_libelle }}</p>
              <hr>
              <div class="text-start">
                <p class="mb-2">
                  <i class="bi bi-envelope me-2 text-muted"></i>
                  {{ user?.email }}
                </p>
                <p class="mb-0">
                  <i class="bi bi-telephone me-2 text-muted"></i>
                  {{ user?.telephone || 'Non renseigné' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Informations personnelles</h5>
            </div>
            <div class="card-body">
              <form #profilForm="ngForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nom</label>
                    <input type="text" class="form-control" [(ngModel)]="userData.nom"
                           name="nom" required [readonly]="!editing">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Prénom</label>
                    <input type="text" class="form-control" [(ngModel)]="userData.prenom"
                           name="prenom" required [readonly]="!editing">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" [(ngModel)]="userData.email"
                         name="email" required [readonly]="!editing">
                </div>

                <div class="mb-3">
                  <label class="form-label">Téléphone</label>
                  <input type="tel" class="form-control" [(ngModel)]="userData.telephone"
                         name="telephone" [readonly]="!editing">
                </div>

                <div class="d-flex justify-content-between">
                  <button type="button" class="btn btn-outline-primary"
                          (click)="toggleEdit()" *ngIf="!editing">
                    <i class="bi bi-pencil me-2"></i>Modifier
                  </button>
                  <div *ngIf="editing">
                    <button type="button" class="btn btn-outline-secondary me-2"
                            (click)="cancelEdit()">
                      Annuler
                    </button>
                    <button type="button" class="btn btn-primary"
                            (click)="saveProfil()" [disabled]="!profilForm.valid">
                      Enregistrer
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="card mt-4">
            <div class="card-header">
              <h5 class="mb-0">Sécurité</h5>
            </div>
            <div class="card-body">
              <button class="btn btn-outline-warning" routerLink="/profil/changer-mot-de-passe">
                <i class="bi bi-key me-2"></i>Changer le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: bold;
      margin: 0 auto;
    }

    input[readonly] {
      background-color: #f8f9fa;
      border-color: #e9ecef;
    }
  `]
})
export class MonProfilComponent {
  private authService = inject(AuthService);

  user = this.authService.getCurrentUser();
  userData: any = {};
  editing = false;

  get userInitials(): string {
    if (!this.user) return '?';
    return `${this.user.prenom[0]}${this.user.nom[0]}`.toUpperCase();
  }

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.userData = {
      nom: this.user?.nom || '',
      prenom: this.user?.prenom || '',
      email: this.user?.email || '',
      telephone: this.user?.telephone || ''
    };
    this.editing = false;
  }

  toggleEdit() {
    this.editing = true;
  }

  cancelEdit() {
    this.resetForm();
  }

  saveProfil() {
    this.authService.updateCurrentUserLocal({
      nom: this.userData.nom?.trim() || '',
      prenom: this.userData.prenom?.trim() || '',
      email: this.userData.email?.trim() || '',
      telephone: this.userData.telephone?.trim() || ''
    });

    this.user = this.authService.getCurrentUser();

    Swal.fire({
      icon: 'success',
      title: 'Profil mis à jour',
      text: 'Les informations sont mises à jour dans la session actuelle.',
      confirmButtonColor: '#0056b3',
      timer: 1500
    });
    this.editing = false;
  }
}
