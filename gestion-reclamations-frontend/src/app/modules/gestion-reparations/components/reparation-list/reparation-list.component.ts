// src/app/modules/gestion-reparations/components/reparation-list/reparation-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReparationService } from '../../../../core/services/reparation.service';
import { Reparation } from '../../../../core/models/reparation.model';

@Component({
  selector: 'app-reparation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="reparation-list">
      <!-- En-tête -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">
            <i class="bi bi-wrench me-2 text-primary"></i>
            Gestion des Réparations
          </h2>
          <p class="text-muted mb-0">Suivi des interventions techniques</p>
        </div>
        <button class="btn btn-primary" routerLink="/reparations/nouvelle">
          <i class="bi bi-plus-circle me-2"></i>Nouvelle Réparation
        </button>
      </div>

      <!-- Filtres -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Réclamation</label>
              <input type="number" class="form-control" placeholder="ID réclamation"
                     [(ngModel)]="filters.reclamation_id" (input)="applyFilters()">
            </div>
            <div class="col-md-3">
              <label class="form-label">Statut</label>
              <select class="form-select" [(ngModel)]="filters.statut" (change)="applyFilters()">
                <option value="">Tous les statuts</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Date de</label>
              <div class="input-group">
                <input type="date" class="form-control" [(ngModel)]="filters.date_from"
                       (change)="applyFilters()">
                <span class="input-group-text">à</span>
                <input type="date" class="form-control" [(ngModel)]="filters.date_to"
                       (change)="applyFilters()">
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

      <!-- Liste des réparations -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Réclamation</th>
                  <th>Équipement</th>
                  <th>Technicien</th>
                  <th>Intervention</th>
                  <th>Durée</th>
                  <th>Coût</th>
                  <th>Statut</th>
                  <th>Opérations</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reparation of filteredReparations">
                  <td>{{ reparation.date_reparation | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <a [routerLink]="['/reclamations', reparation.reclamation_id]"
                       class="text-decoration-none">
                      {{ reparation.reclamation_numero }}
                    </a>
                  </td>
                  <td>{{ reparation.equipement_nom }}</td>
                  <td>{{ reparation.technicien_nom || ('ID ' + reparation.technicien_id) }}</td>
                  <td class="text-truncate" style="max-width: 150px;">
                    {{ reparation.actions }}
                  </td>
                  <td>{{ reparation.duree_intervention || '-' }}</td>
                  <td>{{ toNumber(reparation.cout_estime) > 0 ? ((toNumber(reparation.cout_estime) | number:'1.2-2') + ' DT') : '-' }}</td>
                  <td>
                    <span [class]="'badge bg-' + getStatutColor(reparation.statut)">
                      {{ getStatutLabel(reparation.statut) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary"
                              [routerLink]="['/reparations', reparation.id]">
                        <i class="bi bi-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredReparations.length === 0">
                  <td colspan="9" class="text-center py-5">
                    <i class="bi bi-wrench fs-1 text-muted d-block mb-2"></i>
                    Aucune réparation trouvée
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <div class="text-muted">
            {{ filteredReparations.length }} réparation(s) trouvée(s)
          </div>
          <div class="text-muted">
            <small>Coût total estimé: {{ totalCost | number:'1.2-2' }} DT</small>
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
export class ReparationListComponent implements OnInit {
  private reparationService = inject(ReparationService);

  reparations: Reparation[] = [];
  filteredReparations: Reparation[] = [];

  filters = {
    reclamation_id: '',
    statut: '',
    date_from: '',
    date_to: ''
  };

  ngOnInit() {
    this.loadReparations();
  }

  loadReparations() {
    this.reparationService.getAll().subscribe({
      next: (data) => {
        this.reparations = data;
        this.filteredReparations = [...data];
      }
    });
  }

  applyFilters() {
    this.filteredReparations = this.reparations.filter(reparation => {
      const matchesReclamation = !this.filters.reclamation_id ||
        reparation.reclamation_id.toString() === this.filters.reclamation_id;
      const matchesStatut = !this.filters.statut || reparation.statut === this.filters.statut;

      let matchesDate = true;
      if (this.filters.date_from) {
        const dateFrom = new Date(this.filters.date_from);
        const repDate = new Date(reparation.date_reparation);
        matchesDate = matchesDate && repDate >= dateFrom;
      }
      if (this.filters.date_to) {
        const dateTo = new Date(this.filters.date_to);
        dateTo.setHours(23, 59, 59, 999);
        const repDate = new Date(reparation.date_reparation);
        matchesDate = matchesDate && repDate <= dateTo;
      }

      return matchesReclamation && matchesStatut && matchesDate;
    });
  }

  clearFilters() {
    this.filters = { reclamation_id: '', statut: '', date_from: '', date_to: '' };
    this.filteredReparations = [...this.reparations];
  }

  refresh() {
    this.loadReparations();
  }

  get totalCost(): number {
    return this.filteredReparations.reduce((sum, r) => sum + this.toNumber(r.cout_estime), 0);
  }

  toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = typeof value === 'number' ? value : parseFloat(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: string): string {
    const colors: Record<string, string> = {
      'en_cours': 'warning',
      'terminee': 'success',
      'annulee': 'danger'
    };
    return colors[statut] || 'secondary';
  }
}
