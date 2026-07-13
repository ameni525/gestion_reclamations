// src/app/modules/gestion-reclamations/components/reclamation-details/reclamation-details.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { ReparationService } from '../../../../core/services/reparation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Reclamation } from '../../../../core/models/reclamation.model';
import { Reparation } from '../../../../core/models/reparation.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reclamation-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="reclamation-details">
      <!-- En-tête -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0">
            <i class="bi bi-clipboard-check me-2"></i>
            Détails de la Réclamation
          </h2>
          <p class="text-muted mb-0">{{ reclamation?.numero }}</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline-secondary" routerLink="/reclamations">
            <i class="bi bi-arrow-left me-2"></i>Retour
          </button>
          <button class="btn btn-outline-warning"
                  [routerLink]="['/reclamations/edit', reclamation?.id]"
                  *ngIf="isAdmin">
            <i class="bi bi-pencil me-2"></i>Modifier
          </button>
        </div>
      </div>

      <!-- Informations principales -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Informations de la réclamation</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <dl>
                    <dt>Numéro</dt>
                    <dd class="fw-bold">{{ reclamation?.numero }}</dd>

                    <dt>Date</dt>
                    <dd>{{ reclamation?.date_reclamation | date:'dd/MM/yyyy' }}</dd>

                    <dt>Type</dt>
                    <dd>{{ getTypeLabel(reclamation?.type) }}</dd>

                    <dt>Équipement</dt>
                    <dd>{{ reclamation?.equipement_nom }} ({{ reclamation?.equipement_reference }})</dd>
                  </dl>
                </div>
                <div class="col-md-6">
                  <dl>
                    <dt>Statut</dt>
                    <dd>
                      <span [class]="'badge bg-' + getStatutColor(reclamation?.statut)">
                        {{ getStatutLabel(reclamation?.statut) }}
                      </span>
                    </dd>

                    <dt>Priorité</dt>
                    <dd>
                      <span [class]="'badge bg-' + getPrioriteColor(reclamation?.priorite)">
                        {{ getPrioriteLabel(reclamation?.priorite) }}
                      </span>
                    </dd>

                    <dt>Contact client</dt>
                    <dd>{{ reclamation?.contact_client || 'Non spécifié' }}</dd>

                    <dt>Technicien assigné</dt>
                    <dd>{{ reclamation?.technicien_nom || (reclamation?.assigned_technicien_id ? ('ID ' + reclamation?.assigned_technicien_id) : 'Non assigné') }}</dd>
                  </dl>
                </div>
              </div>

              <div class="mt-3">
                <dt>Description</dt>
                <dd class="border rounded p-3 bg-light">{{ reclamation?.description }}</dd>
              </div>

              <div class="mt-3" *ngIf="reclamation?.notes">
                <dt>Notes supplémentaires</dt>
                <dd class="border rounded p-3 bg-light">{{ reclamation?.notes }}</dd>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="col-md-4">
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">Actions</h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                        <button class="btn btn-primary"
                        [routerLink]="['/reparations/nouvelle']"
                        [queryParams]="{reclamation: reclamation?.id}"
                        *ngIf="isAdmin || isTechnicien">
                  <i class="bi bi-wrench me-2"></i>Ajouter une réparation
                </button>

                <button class="btn btn-outline-info"
                        [routerLink]="['/reparations']"
                        [queryParams]="{reclamation_id: reclamation?.id}">
                  <i class="bi bi-list-check me-2"></i>Voir les réparations
                </button>
              </div>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Statistiques</h6>
            </div>
            <div class="card-body">
              <div class="text-center">
                <div class="mb-3">
                  <div class="h3 mb-0">{{ reparations.length }}</div>
                  <small class="text-muted">Réparations</small>
                </div>
                <div class="progress mb-2" style="height: 10px;">
                  <div class="progress-bar bg-success"
                       [style.width]="getCompletionPercentage() + '%'"></div>
                </div>
                <small class="text-muted">Progression</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des réparations -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Historique des réparations</h5>
          <span class="badge bg-primary">{{ reparations.length }}</span>
        </div>
        <div class="card-body">
          <div class="table-responsive" *ngIf="reparations.length > 0">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Technicien</th>
                  <th>Actions</th>
                  <th>Durée</th>
                  <th>Coût</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reparation of reparations">
                  <td>{{ reparation.date_reparation | date:'dd/MM/yyyy' }}</td>
                  <td>{{ reparation.technicien_nom }}</td>
                  <td class="text-truncate" style="max-width: 200px;">
                    {{ reparation.actions }}
                  </td>
                  <td>{{ reparation.duree_intervention || '-' }}</td>
                  <td>{{ reparation.cout_estime ? (reparation.cout_estime + ' DT') : '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-success': reparation.statut === 'terminee',
                      'bg-warning': reparation.statut === 'en_cours',
                      'bg-secondary': reparation.statut === 'annulee'
                    }">
                      {{ reparation.statut === 'terminee' ? 'Terminée' :
                         reparation.statut === 'en_cours' ? 'En cours' : 'Annulée' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="reparations.length === 0" class="text-center py-4">
            <i class="bi bi-wrench fs-1 text-muted d-block mb-2"></i>
            <p class="text-muted">Aucune réparation enregistrée pour cette réclamation.</p>
            <button class="btn btn-primary"
                    [routerLink]="['/reparations/nouvelle']"
                    [queryParams]="{reclamation: reclamation?.id}">
              <i class="bi bi-plus-circle me-2"></i>Ajouter la première réparation
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    dl dt {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.875rem;
    }

    dl dd {
      margin-bottom: 0.75rem;
    }

    .progress {
      background-color: #e9ecef;
    }
  `]
})
export class ReclamationDetailsComponent implements OnInit {
  private reclamationService = inject(ReclamationService);
  private reparationService = inject(ReparationService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  reclamation: Reclamation | null = null;
  reparations: Reparation[] = [];

  isAdmin = this.authService.isAdmin();
  isTechnicien = this.authService.isTechnicien();

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadReclamation(id);
      this.loadReparations(id);
    }
  }

  loadReclamation(id: number) {
    this.reclamationService.getById(id).subscribe({
      next: (data) => {
        this.reclamation = data;
      }
    });
  }

  loadReparations(reclamationId: number) {
    this.reparationService.getByReclamation(reclamationId).subscribe({
      next: (data) => {
        this.reparations = data;
      }
    });
  }

  // Ligne 257 - Corriger la méthode
getCompletionPercentage(): number {
  if (!this.reparations || this.reparations.length === 0) return 0;

  const total = this.reparations.length;
  const completed = this.reparations.filter((r: any) => r.statut === 'terminee').length;

  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

  getTypeLabel(type: string | undefined): string {
    if (!type) return '';
    const labels: Record<string, string> = {
      'panne_technique': 'Panne technique',
      'dysfonctionnement': 'Dysfonctionnement',
      'insatisfaction': 'Insatisfaction',
      'autre': 'Autre'
    };
    return labels[type] || type;
  }

  getStatutLabel(statut: string | undefined): string {
    if (!statut) return '';
    const labels: Record<string, string> = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'traitee': 'Traitée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: string | undefined): string {
    if (!statut) return 'secondary';
    const colors: Record<string, string> = {
      'en_attente': 'warning',
      'en_cours': 'info',
      'traitee': 'success',
      'annulee': 'danger'
    };
    return colors[statut] || 'secondary';
  }

  getPrioriteLabel(priorite: string | undefined): string {
    if (!priorite) return '';
    const labels: Record<string, string> = {
      'basse': 'Basse',
      'moyenne': 'Moyenne',
      'haute': 'Haute',
      'urgente': 'Urgente'
    };
    return labels[priorite] || priorite;
  }

  getPrioriteColor(priorite: string | undefined): string {
    if (!priorite) return 'secondary';
    const colors: Record<string, string> = {
      'basse': 'secondary',
      'moyenne': 'primary',
      'haute': 'warning',
      'urgente': 'danger'
    };
    return colors[priorite] || 'secondary';
  }
}
