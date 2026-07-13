// src/app/modules/gestion-reclamations/components/reclamation-form/reclamation-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { EquipementService } from '../../../../core/services/equipement.service';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reclamation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="bi bi-clipboard-plus me-2"></i>
                {{ isEditMode ? 'Modifier Réclamation' : 'Nouvelle Réclamation' }}
              </h4>
            </div>
            <div class="card-body">
              <form #reclamationForm="ngForm" (ngSubmit)="onSubmit()">
                <!-- Informations de base -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Date de réclamation *</label>
                    <input type="date" class="form-control"
                           [(ngModel)]="reclamation.date_reclamation"
                           name="date_reclamation" required>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Type *</label>
                    <select class="form-select"
                            [(ngModel)]="reclamation.type"
                            name="type" required>
                      <option value="">Sélectionner un type</option>
                      <option value="panne_technique">Panne technique</option>
                      <option value="dysfonctionnement">Dysfonctionnement</option>
                      <option value="insatisfaction">Insatisfaction</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <!-- Équipement -->
                <div class="mb-3">
                  <label class="form-label">Équipement *</label>
                  <select class="form-select"
                          [(ngModel)]="reclamation.equipement_id"
                          name="equipement_id" required>
                    <option value="">Sélectionner un équipement</option>
                    <option *ngFor="let equipement of equipements" [value]="equipement.id">
                      {{ equipement.nom }} ({{ equipement.reference }}) - {{ equipement.atelier }}
                    </option>
                  </select>
                </div>

                <!-- Description -->
                <div class="mb-3">
                  <label class="form-label">Description *</label>
                  <textarea class="form-control" rows="3"
                            [(ngModel)]="reclamation.description"
                            name="description" required></textarea>
                </div>

                <!-- Informations supplémentaires -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Délai souhaité</label>
                    <input type="date" class="form-control"
                           [(ngModel)]="reclamation.delai_souhaite"
                           name="delai_souhaite">
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Contact client</label>
                    <input type="tel" class="form-control"
                           [(ngModel)]="reclamation.contact_client"
                           name="contact_client">
                  </div>
                </div>

                <!-- Priorité et statut -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Priorité</label>
                    <select class="form-select"
                            [(ngModel)]="reclamation.priorite"
                            name="priorite">
                      <option value="basse">Basse</option>
                      <option value="moyenne" selected>Moyenne</option>
                      <option value="haute">Haute</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3" *ngIf="isEditMode">
                    <label class="form-label">Statut</label>
                    <select class="form-select"
                            [(ngModel)]="reclamation.statut"
                            name="statut">
                      <option value="en_attente">En attente</option>
                      <option value="en_cours">En cours</option>
                      <option value="traitee">Traitée</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </div>
                </div>

                <!-- Assignation technicien -->
                <div class="mb-3" *ngIf="isAdmin">
                  <label class="form-label">Technicien assigné</label>
                  <select class="form-select"
                          [(ngModel)]="reclamation.assigned_technicien_id"
                          name="assigned_technicien_id">
                    <option value="">Non assigné</option>
                    <option *ngFor="let technicien of techniciens" [value]="technicien.id">
                      {{ technicien.nom }} {{ technicien.prenom }}
                    </option>
                  </select>
                </div>

                <!-- Notes -->
                <div class="mb-3">
                  <label class="form-label">Notes supplémentaires</label>
                  <textarea class="form-control" rows="2"
                            [(ngModel)]="reclamation.notes"
                            name="notes"></textarea>
                </div>

                <!-- Boutons -->
                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary" routerLink="/reclamations">
                    <i class="bi bi-arrow-left me-2"></i>Retour
                  </button>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="!reclamationForm.valid || loading">
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
export class ReclamationFormComponent implements OnInit {
  private reclamationService = inject(ReclamationService);
  private equipementService = inject(EquipementService);
  private utilisateurService = inject(UtilisateurService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  loading = false;
  equipements: any[] = [];
  techniciens: any[] = [];

  reclamation: any = {
    date_reclamation: new Date().toISOString().split('T')[0],
    type: '',
    description: '',
    equipement_id: '',
    delai_souhaite: '',
    contact_client: '',
    statut: 'en_attente',
    priorite: 'moyenne',
    assigned_technicien_id: '',
    notes: ''
  };

  isAdmin = this.authService.isAdmin();

  ngOnInit() {
    this.loadEquipements();
    this.loadTechniciens();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadReclamation(id);
    }
  }

  loadEquipements() {
    this.equipementService.getAll().subscribe({
      next: (data) => {
        this.equipements = data;
      }
    });
  }

  loadTechniciens() {
    if (this.isAdmin) {
      this.utilisateurService.getTechniciens().subscribe({
        next: (data) => {
          this.techniciens = data;
        }
      });
    }
  }

  loadReclamation(id: number) {
    this.reclamationService.getById(id).subscribe({
      next: (data) => {
        this.reclamation = {
          ...data,
          date_reclamation: data.date_reclamation.split('T')[0],
          delai_souhaite: data.delai_souhaite ? data.delai_souhaite.split('T')[0] : ''
        };
      }
    });
  }

  onSubmit() {
    if (this.loading) return;

    this.loading = true;

    const request = this.isEditMode
      ? this.reclamationService.update(this.reclamation.id, this.reclamation)
      : this.reclamationService.create(this.reclamation);

    request.subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: `Réclamation ${this.isEditMode ? 'mise à jour' : 'créée'} avec succès`,
          confirmButtonColor: '#0056b3'
        }).then(() => {
          this.router.navigate(['/reclamations']);
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
