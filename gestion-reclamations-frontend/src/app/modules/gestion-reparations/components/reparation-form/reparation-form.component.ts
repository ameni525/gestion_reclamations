// src/app/modules/gestion-reparations/components/reparation-form/reparation-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReparationService } from '../../../../core/services/reparation.service';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reparation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="bi bi-wrench me-2"></i>
                Nouvelle Réparation
              </h4>
            </div>
            <div class="card-body">
              <form #reparationForm="ngForm" (ngSubmit)="onSubmit()">
                <!-- Réclamation -->
                <div class="mb-3">
                  <label class="form-label">Réclamation *</label>
                  <select class="form-select"
                          [(ngModel)]="reparation.reclamation_id"
                          name="reclamation_id" required
                          [disabled]="reclamationIdFromQuery">
                    <option value="">Sélectionner une réclamation</option>
                    <option *ngFor="let reclamation of reclamations" [value]="reclamation.id">
                      {{ reclamation.numero }} - {{ reclamation.description }}
                    </option>
                  </select>
                  <small *ngIf="reclamationIdFromQuery" class="text-muted">
                    Cette réparation est liée à la réclamation {{ selectedReclamation?.numero }}
                  </small>
                </div>

                <!-- Date et technicien -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Date de réparation *</label>
                    <input type="date" class="form-control"
                           [(ngModel)]="reparation.date_reparation"
                           name="date_reparation" required>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Technicien *</label>
                    <select class="form-select"
                            [(ngModel)]="reparation.technicien_id"
                            name="technicien_id" required
                            [disabled]="isTechnicien && !isAdmin">
                      <option value="">Sélectionner un technicien</option>
                      <option *ngFor="let technicien of techniciens" [value]="technicien.id">
                        {{ technicien.nom }} {{ technicien.prenom }}
                      </option>
                    </select>
                    <small *ngIf="isTechnicien && !isAdmin" class="text-muted">
                      Vous êtes automatiquement assigné comme technicien
                    </small>
                  </div>
                </div>

                <!-- Actions -->
                <div class="mb-3">
                  <label class="form-label">Actions effectuées *</label>
                  <textarea class="form-control" rows="3"
                            [(ngModel)]="reparation.actions"
                            name="actions" required></textarea>
                </div>

                <!-- Informations techniques -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Durée (minutes)</label>
                    <input type="number" class="form-control"
                           [(ngModel)]="reparation.duree_intervention"
                           name="duree_intervention" min="0">
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Coût estimé (DT)</label>
                    <input type="number" class="form-control" step="0.01"
                           [(ngModel)]="reparation.cout_estime"
                           name="cout_estime" min="0">
                  </div>
                </div>

                <!-- Pièces utilisées -->
                <div class="mb-3">
                  <label class="form-label">Pièces utilisées</label>
                  <textarea class="form-control" rows="2"
                            [(ngModel)]="reparation.pieces_utilisees"
                            name="pieces_utilisees"></textarea>
                </div>

                <!-- Statut -->
                <div class="mb-3">
                  <label class="form-label">Statut</label>
                  <select class="form-select"
                          [(ngModel)]="reparation.statut"
                          name="statut">
                    <option value="en_cours">En cours</option>
                    <option value="terminee" selected>Terminée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>

                <!-- Boutons -->
                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary" routerLink="/reparations">
                    <i class="bi bi-arrow-left me-2"></i>Retour
                  </button>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="!reparationForm.valid || loading">
                    <span *ngIf="!loading">
                      <i class="bi bi-check-circle me-2"></i>
                      Créer
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
export class ReparationFormComponent implements OnInit {
  private reparationService = inject(ReparationService);
  private reclamationService = inject(ReclamationService);
  private utilisateurService = inject(UtilisateurService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  reclamations: any[] = [];
  techniciens: any[] = [];
  selectedReclamation: any = null;
  reclamationIdFromQuery = false;

  reparation: any = {
    reclamation_id: '',
    date_reparation: new Date().toISOString().split('T')[0],
    technicien_id: '',
    actions: '',
    duree_intervention: '',
    cout_estime: '',
    pieces_utilisees: '',
    statut: 'terminee'
  };

  isAdmin = this.authService.isAdmin();
  isTechnicien = this.authService.isTechnicien();

  ngOnInit() {
    this.loadReclamations();

    // Vérifier si une réclamation est spécifiée dans l'URL
    const reclamationId = this.route.snapshot.queryParams['reclamation'];
    if (reclamationId) {
      this.reclamationIdFromQuery = true;
      this.reparation.reclamation_id = reclamationId;
      this.loadReclamationDetails(reclamationId);
    }

    // Définir le technicien par défaut
    const currentUser = this.authService.getCurrentUser();
    if (this.isTechnicien && currentUser) {
      this.reparation.technicien_id = currentUser.id;
      this.techniciens = [currentUser];
    } else {
      this.loadTechniciens();
    }
  }

  loadReclamations() {
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.reclamations = data.filter(r => r.statut !== 'traitee' && r.statut !== 'annulee');
      }
    });
  }

  loadReclamationDetails(id: string) {
    this.reclamationService.getById(parseInt(id)).subscribe({
      next: (data) => {
        this.selectedReclamation = data;
      }
    });
  }

  loadTechniciens() {
    this.utilisateurService.getTechniciens().subscribe({
      next: (data) => {
        this.techniciens = data;
      }
    });
  }

  onSubmit() {
    if (this.loading) return;

    this.loading = true;

    const request = this.reparationService.create(this.reparation);

    request.subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Réparation créée avec succès',
          confirmButtonColor: '#0056b3'
        }).then(() => {
          this.router.navigate(['/reparations']);
        });
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error?.error || 'Une erreur est survenue',
          confirmButtonColor: '#dc3545'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
