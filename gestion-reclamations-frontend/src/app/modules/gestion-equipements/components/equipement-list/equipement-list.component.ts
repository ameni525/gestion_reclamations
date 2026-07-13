// src/app/modules/gestion-equipements/components/equipement-list/equipement-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EquipementService } from '../../../../core/services/equipement.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Equipement } from '../../../../core/models/equipement.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-equipement-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="equipement-list">
      <!-- En-tête -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">
            <i class="bi bi-tools me-2 text-primary"></i>
            Gestion des Équipements
          </h2>
          <p class="text-muted mb-0">Parc d'équipements SOFIMA</p>
        </div>
        <button class="btn btn-primary" routerLink="/equipements/nouveau"
                *ngIf="isAdmin">
          <i class="bi bi-plus-circle me-2"></i>Nouvel Équipement
        </button>
      </div>

      <!-- Filtres -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Atelier</label>
              <select class="form-select" [(ngModel)]="filters.atelier" (change)="applyFilters()">
                <option value="">Tous les ateliers</option>
                <option *ngFor="let atelier of ateliers" [value]="atelier">{{ atelier }}</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Catégorie</label>
              <select class="form-select" [(ngModel)]="filters.categorie" (change)="applyFilters()">
                <option value="">Toutes les catégories</option>
                <option *ngFor="let categorie of categories" [value]="categorie">{{ categorie }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Recherche</label>
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Nom, référence..."
                       [(ngModel)]="filters.search" (input)="applyFilters()">
                <button class="btn btn-outline-secondary" type="button" (click)="clearFilters()">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-outline-secondary w-100" (click)="refresh()">
                <i class="bi bi-arrow-clockwise"></i> Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des équipements -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Nom</th>
                  <th>Référence</th>
                  <th>Catégorie</th>
                  <th>Atelier</th>
                  <th>Ligne</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let equipement of filteredEquipements">
                  <td>
                    <div class="d-flex align-items-center">
                      <i class="bi bi-tools me-2 text-muted"></i>
                      <strong>{{ equipement.nom }}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ equipement.reference }}</span>
                  </td>
                  <td>{{ equipement.categorie || '-' }}</td>
                  <td>
                    <span *ngIf="equipement.atelier" class="badge bg-info">
                      {{ equipement.atelier }}
                    </span>
                    <span *ngIf="!equipement.atelier" class="text-muted">-</span>
                  </td>
                  <td>{{ equipement.ligne_production || '-' }}</td>
                  <td>
                    <span [class]="'badge bg-' + (equipement.actif ? 'success' : 'danger')">
                      {{ equipement.actif ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary"
                              [routerLink]="['/equipements', equipement.id]">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning"
                              [routerLink]="['/equipements/edit', equipement.id]"
                              *ngIf="isAdmin">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger"
                              (click)="deleteEquipement(equipement)"
                              *ngIf="isAdmin">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredEquipements.length === 0">
                  <td colspan="7" class="text-center py-5">
                    <i class="bi bi-tools fs-1 text-muted d-block mb-2"></i>
                    Aucun équipement trouvé
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <div class="text-muted">
            {{ filteredEquipements.length }} équipement(s) trouvé(s)
          </div>
          <div class="text-muted">
            <small>Total: {{ equipements.length }} équipements</small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.8em;
    }
  `]
})
export class EquipementListComponent implements OnInit {
  private equipementService = inject(EquipementService);
  private authService = inject(AuthService);

  equipements: Equipement[] = [];
  filteredEquipements: Equipement[] = [];
  ateliers: string[] = [];
  categories: string[] = [];

  filters = {
    atelier: '',
    categorie: '',
    search: ''
  };

  isAdmin = this.authService.isAdmin();

  ngOnInit() {
    this.loadEquipements();
    this.loadFilters();
  }

  loadEquipements() {
    this.equipementService.getAll().subscribe({
      next: (data) => {
        this.equipements = data;
        this.filteredEquipements = [...data];
      }
    });
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
}

  applyFilters() {
    this.filteredEquipements = this.equipements.filter(equipement => {
      const matchesAtelier = !this.filters.atelier || equipement.atelier === this.filters.atelier;
      const matchesCategorie = !this.filters.categorie || equipement.categorie === this.filters.categorie;
      const matchesSearch = !this.filters.search ||
        equipement.nom.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        (equipement.reference && equipement.reference.toLowerCase().includes(this.filters.search.toLowerCase()));

      return matchesAtelier && matchesCategorie && matchesSearch;
    });
  }

  clearFilters() {
    this.filters = { atelier: '', categorie: '', search: '' };
    this.filteredEquipements = [...this.equipements];
  }

  refresh() {
    this.loadEquipements();
  }

  deleteEquipement(equipement: Equipement) {
    Swal.fire({
      title: 'Supprimer cet équipement ?',
      text: `L'équipement "${equipement.nom}" sera retiré de la liste active.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.equipementService.delete(equipement.id).subscribe({
          next: () => {
            Swal.fire(
              'Succès!',
              `L'équipement a été supprimé avec succès.`,
              'success'
            );
            this.loadEquipements();
          }
        });
      }
    });
  }
}
