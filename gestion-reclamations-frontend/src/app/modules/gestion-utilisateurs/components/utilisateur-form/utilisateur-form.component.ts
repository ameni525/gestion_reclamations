// src/app/modules/gestion-utilisateurs/components/utilisateur-form/utilisateur-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-utilisateur-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="bi bi-person me-2"></i>
                {{ isEditMode ? 'Modifier Utilisateur' : 'Nouvel Utilisateur' }}
              </h4>
            </div>
            <div class="card-body">
              <form #utilisateurForm="ngForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Nom *</label>
                    <input type="text" class="form-control"
                           [(ngModel)]="utilisateur.nom"
                           name="nom" required>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Prénom *</label>
                    <input type="text" class="form-control"
                           [(ngModel)]="utilisateur.prenom"
                           name="prenom" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control"
                         [(ngModel)]="utilisateur.email"
                         name="email" required>
                </div>

                <div class="mb-3">
                  <label class="form-label">Téléphone</label>
                  <input type="tel" class="form-control"
                         [(ngModel)]="utilisateur.telephone"
                         name="telephone">
                </div>

                <div class="mb-3">
                  <label class="form-label">Rôle *</label>
                  <select class="form-select"
                          [(ngModel)]="utilisateur.role_id"
                          name="role_id" required>
                    <option value="">Sélectionner un rôle</option>
                    <option *ngFor="let role of roles" [value]="role.id">
                      {{ role.libelle }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">{{ isEditMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *' }}</label>
                  <input type="password" class="form-control"
                         [(ngModel)]="utilisateur.password"
                         name="password" [required]="!isEditMode" minlength="8">
                  <small class="text-muted">
                    Minimum 8 caractères{{ isEditMode ? ', laisser vide pour garder le mot de passe actuel' : '' }}
                  </small>
                </div>

                <div class="mb-3 form-check" *ngIf="isEditMode">
                  <input type="checkbox" class="form-check-input"
                         id="actif" [(ngModel)]="utilisateur.actif" name="actif">
                  <label class="form-check-label" for="actif">Compte actif</label>
                </div>

                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary" routerLink="/utilisateurs">
                    <i class="bi bi-arrow-left me-2"></i>Retour
                  </button>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="loading || !utilisateurForm.valid">
                    <span *ngIf="!loading">
                      <i class="bi bi-check-circle me-2"></i>
                      {{ isEditMode ? 'Mettre à jour' : 'Créer' }}
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
export class UtilisateurFormComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  utilisateurId: number | null = null;
  loading = false;
  roles: any[] = [];

  utilisateur: any = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role_id: '',
    password: '',
    actif: true
  };

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.utilisateurId = +id;
    }

    this.loadRoles();
  }

  loadRoles() {
    this.utilisateurService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        if (this.isEditMode && this.utilisateurId) {
          this.loadUtilisateur(this.utilisateurId);
        }
      }
    });
  }

  loadUtilisateur(id: number) {
    this.utilisateurService.getById(id).subscribe({
      next: (data) => {
        this.utilisateur = {
          ...data,
          role_id: this.getRoleId(data.role),
          password: ''
        };
      }
    });
  }

  getRoleId(roleCode: string): number | string {
    const role = this.roles.find(r => r.code === roleCode);
    return role ? role.id : '';
  }

  onSubmit() {
    if (this.loading) return;

    this.loading = true;

    const request = this.isEditMode
      ? this.utilisateurService.update(this.utilisateur.id, this.utilisateur)
      : this.utilisateurService.create(this.utilisateur);

    request.subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: `Utilisateur ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès`,
          confirmButtonColor: '#0056b3'
        }).then(() => {
          this.router.navigate(['/utilisateurs']);
        });
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.getErrorMessage(error),
          confirmButtonColor: '#dc3545'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private getErrorMessage(error: any): string {
    return error?.error?.error || error?.error?.message || error?.message || 'Une erreur est survenue';
  }
}
