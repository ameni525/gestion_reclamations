// src/app/modules/gestion-reparations/components/reparation-details/reparation-details.component.ts
// Correction de l'erreur "Object is possibly 'null'"
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReparationService } from '../../../../core/services/reparation.service';
import { Reparation } from '../../../../core/models/reparation.model';

@Component({
  selector: 'app-reparation-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h4 class="mb-0">
            <i class="bi bi-wrench me-2"></i>
            Détails de la réparation
          </h4>
          <button class="btn btn-outline-secondary" routerLink="/reparations">
            <i class="bi bi-arrow-left me-2"></i>Retour
          </button>
        </div>
        <div class="card-body">
          <div *ngIf="reparation" class="row">
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Date</dt>
                <dd class="col-sm-8 fw-bold">
                  {{ reparation.date_reparation | date:'dd/MM/yyyy' }}
                </dd>

                <dt class="col-sm-4">Réclamation</dt>
                <dd class="col-sm-8">
                  <a [routerLink]="['/reclamations', reparation.reclamation_id]"
                     class="text-decoration-none">
                    {{ reparation.reclamation_numero }}
                  </a>
                </dd>

                <dt class="col-sm-4">Technicien</dt>
                <dd class="col-sm-8">{{ reparation.technicien_nom || ('ID ' + reparation.technicien_id) }}</dd>

                <dt class="col-sm-4">Durée</dt>
                <dd class="col-sm-8">
                  {{ reparation.duree_intervention || '-' }} minutes
                </dd>
              </dl>
            </div>
            <div class="col-md-6">
              <dl class="row">
                <dt class="col-sm-4">Coût estimé</dt>
                <dd class="col-sm-8 fw-bold">
                  {{ reparation.cout_estime ? (reparation.cout_estime + ' DT') : '-' }}
                </dd>

                <dt class="col-sm-4">Statut</dt>
                <dd class="col-sm-8">
                  <span [class]="'badge bg-' + getStatutColor(reparation.statut)">
                    {{ getStatutLabel(reparation.statut) }}
                  </span>
                </dd>

                <dt class="col-sm-4">Date création</dt>
                <dd class="col-sm-8">
                  {{ reparation.created_at | date:'dd/MM/yyyy HH:mm' }}
                </dd>
              </dl>
            </div>
          </div>

          <!-- Actions effectuées -->
          <div class="mt-4" *ngIf="reparation">
            <h6>Actions effectuées</h6>
            <div class="border rounded p-3 bg-light">
              {{ reparation.actions }}
            </div>
          </div>

          <!-- Pièces utilisées -->
          <div class="mt-4" *ngIf="reparation && reparation.pieces_utilisees">
            <h6>Pièces utilisées</h6>
            <div class="border rounded p-3 bg-light">
              {{ reparation.pieces_utilisees }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReparationDetailsComponent implements OnInit {
  private reparationService = inject(ReparationService);
  private route = inject(ActivatedRoute);

  reparation: Reparation | null = null;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadReparation(id);
    }
  }

  loadReparation(id: number) {
    this.reparationService.getById(id).subscribe({
      next: (data) => {
        this.reparation = data;
      }
    });
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
