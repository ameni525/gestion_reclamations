// src/app/modules/gestion-equipements/components/equipement-form/equipement-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipementService } from '../../../../core/services/equipement.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-equipement-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">
                <i class="bi bi-tools me-2"></i>
                {{ isEditMode ? 'Modifier Équipement' : 'Nouvel Équipement' }}
              </h4>
            </div>
            <div class="card-body">
              <form #equipementForm="ngForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Nom *</label>
                  <input type="text" class="form-control"
                         [(ngModel)]="equipement.nom"
                         name="nom" required>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Catégorie</label>
                    <select class="form-select"
                            [(ngModel)]="equipement.categorie"
                            name="categorie">
                      <option value="">Sélectionner une catégorie</option>
                      <option *ngFor="let categorie of categories" [value]="categorie">
                        {{ categorie }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Référence</label>
                    <input type="text" class="form-control"
                           [(ngModel)]="equipement.reference"
                           name="reference">
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Atelier</label>
                    <select class="form-select"
                            [(ngModel)]="equipement.atelier"
                            name="atelier">
                      <option value="">Sélectionner un atelier</option>
                      <option *ngFor="let atelier of ateliers" [value]="atelier">
                        {{ atelier }}
                      </option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label class="form-label">Ligne de production</label>
                    <select class="form-select"
                            [(ngModel)]="equipement.ligne_production"
                            name="ligne_production">
                      <option value="">Sélectionner une ligne</option>
                      <option *ngFor="let ligne of lignesProduction" [value]="ligne">
                        {{ ligne }}
                      </option>
                    </select>
                  </div>
                </div>

                <div class="mb-3 form-check" *ngIf="isEditMode">
                  <input type="checkbox" class="form-check-input"
                         id="actif" [(ngModel)]="equipement.actif" name="actif">
                  <label class="form-check-label" for="actif">Équipement actif</label>
                </div>

                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary" routerLink="/equipements">
                    <i class="bi bi-arrow-left me-2"></i>Retour
                  </button>
                  <button type="submit" class="btn btn-primary"
                          [disabled]="!equipementForm.valid || loading">
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
export class EquipementFormComponent implements OnInit {
  private equipementService = inject(EquipementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = false;
  loading = false;
  ateliers: string[] = [];
  categories: string[] = [];
  lignesProduction: string[] = [];

  equipement: any = {
    nom: '',
    categorie: '',
    reference: '',
    atelier: '',
    ligne_production: '',
    actif: true
  };

  ngOnInit() {
    this.loadFilters();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.loadEquipement(id);
    }
  }

  // Modifiez ces lignes dans loadFilters() :
loadFilters() {
  this.equipementService.getAteliers().subscribe({
    next: (data: string[]) => {  // Ajoutez le type
      this.ateliers = data;
    }
  });
  this.equipementService.getCategories().subscribe({
    next: (data: string[]) => {  // Ajoutez le type
      this.categories = data;
    }
  });
  this.equipementService.getLignesProduction().subscribe({
    next: (data: string[]) => {  // Ajoutez le type
      this.lignesProduction = data;
    }
  });
}

  loadEquipement(id: number) {
    this.equipementService.getById(id).subscribe({
      next: (data) => {
        this.equipement = data;
      }
    });
  }

  onSubmit() {
    if (this.loading) return;

    this.loading = true;

    const request = this.isEditMode
      ? this.equipementService.update(this.equipement.id, this.equipement)
      : this.equipementService.create(this.equipement);

    request.subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: `Équipement ${this.isEditMode ? 'mis à jour' : 'créé'} avec succès`,
          confirmButtonColor: '#0056b3'
        }).then(() => {
          this.router.navigate(['/equipements']);
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
