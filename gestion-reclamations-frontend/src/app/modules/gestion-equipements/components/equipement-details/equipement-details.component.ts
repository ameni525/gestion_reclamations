// src/app/modules/gestion-equipements/components/equipement-details/equipement-details.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EquipementService } from '../../../../core/services/equipement.service';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { Equipement } from '../../../../core/models/equipement.model';
import { Reclamation } from '../../../../core/models/reclamation.model';

@Component({
  selector: 'app-equipement-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h4 class="mb-0">
            <i class="bi bi-tools me-2"></i>
            Détails de l'équipement
          </h4>
          <button class="btn btn-outline-secondary" routerLink="/equipements">
            <i class="bi bi-arrow-left me-2"></i>Retour
          </button>
        </div>
        <div class="card-body">
          <div *ngIf="equipement" class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Nom</dt>
                <dd class="col-sm-8 fw-bold">{{ equipement.nom }}</dd>

                <dt class="col-sm-4">Référence</dt>
                <dd class="col-sm-8">
                  <span class="badge bg-light text-dark">{{ equipement.reference }}</span>
                </dd>

                <dt class="col-sm-4">Catégorie</dt>
                <dd class="col-sm-8">{{ equipement.categorie || '-' }}</dd>

                <dt class="col-sm-4">Atelier</dt>
                <dd class="col-sm-8">
                  <span *ngIf="equipement.atelier" class="badge bg-info">
                    {{ equipement.atelier }}
                  </span>
                  <span *ngIf="!equipement.atelier" class="text-muted">-</span>
                </dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Ligne de production</dt>
                <dd class="col-sm-8">{{ equipement.ligne_production || '-' }}</dd>

                <dt class="col-sm-4">Statut</dt>
                <dd class="col-sm-8">
                  <span [class]="'badge bg-' + (equipement.actif ? 'success' : 'danger')">
                    {{ equipement.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </dd>

                <dt class="col-sm-4">Date création</dt>
                <dd class="col-sm-8">{{ equipement.created_at | date:'dd/MM/yyyy HH:mm' }}</dd>

                <dt class="col-sm-4">Dernière mise à jour</dt>
                <dd class="col-sm-8">{{ equipement.updated_at | date:'dd/MM/yyyy HH:mm' }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Réclamations associées -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-clipboard-check me-2"></i>
            Réclamations associées ({{ reclamations.length }})
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive" *ngIf="reclamations.length > 0">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>N° Réclamation</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reclamation of reclamations"
                    [routerLink]="['/reclamations', reclamation.id]"
                    style="cursor: pointer;">
                  <td class="fw-bold">{{ reclamation.numero }}</td>
                  <td>{{ reclamation.date_reclamation | date:'dd/MM/yyyy' }}</td>
                  <td class="text-truncate" style="max-width: 200px;">
                    {{ reclamation.description }}
                  </td>
                  <td>
                    <span [class]="'badge bg-' + getStatutColor(reclamation.statut)">
                      {{ getStatutLabel(reclamation.statut) }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + getPrioriteColor(reclamation.priorite)">
                      {{ getPrioriteLabel(reclamation.priorite) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="reclamations.length === 0" class="text-center py-4">
            <i class="bi bi-clipboard-x fs-1 text-muted d-block mb-2"></i>
            <p class="text-muted">Aucune réclamation pour cet équipement.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EquipementDetailsComponent implements OnInit {
  private equipementService = inject(EquipementService);
  private reclamationService = inject(ReclamationService);
  private route = inject(ActivatedRoute);

  equipement: Equipement | null = null;
  reclamations: Reclamation[] = [];

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEquipement(id);
      this.loadReclamations(id);
    }
  }

  loadEquipement(id: number) {
    this.equipementService.getById(id).subscribe({
      next: (data) => {
        this.equipement = data;
      }
    });
  }

  loadReclamations(equipementId: number) {
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.reclamations = data.filter((r) => r.equipement_id === +equipementId);
      }
    });
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'traitee': 'Traitée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: string): string {
    const colors: Record<string, string> = {
      'en_attente': 'warning',
      'en_cours': 'info',
      'traitee': 'success',
      'annulee': 'danger'
    };
    return colors[statut] || 'secondary';
  }

  getPrioriteLabel(priorite: string): string {
    const labels: Record<string, string> = {
      'basse': 'Basse',
      'moyenne': 'Moyenne',
      'haute': 'Haute',
      'urgente': 'Urgente'
    };
    return labels[priorite] || priorite;
  }

  getPrioriteColor(priorite: string): string {
    const colors: Record<string, string> = {
      'basse': 'secondary',
      'moyenne': 'primary',
      'haute': 'warning',
      'urgente': 'danger'
    };
    return colors[priorite] || 'secondary';
  }
}
