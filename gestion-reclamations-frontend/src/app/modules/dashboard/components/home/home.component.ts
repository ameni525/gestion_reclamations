import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ReclamationService } from '../../../../core/services/reclamation.service';
import { ReparationService } from '../../../../core/services/reparation.service';
import { EquipementService } from '../../../../core/services/equipement.service';
import { Reclamation } from '../../../../core/models/reclamation.model';
import { Reparation } from '../../../../core/models/reparation.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-home">
      <div class="row mb-4">
        <div class="col">
          <h2 class="h4 mb-0">Tableau de bord</h2>
          <p class="text-muted mb-0">Bienvenue {{ user?.prenom }} {{ user?.nom }}</p>
        </div>
        <div class="col-auto">
          <div class="user-role-badge">
            <span class="badge" [ngClass]="getRoleBadgeClass()">{{ user?.role_libelle }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
        <div class="col">
          <div class="card border-primary h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Réclamations en attente</h6>
                  <h3 class="card-title mt-2">{{ stats.reclamationsEnAttente || 0 }}</h3>
                </div>
                <i class="bi bi-clipboard text-primary fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card border-warning h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Réclamations en cours</h6>
                  <h3 class="card-title mt-2">{{ stats.reclamationsEnCours || 0 }}</h3>
                </div>
                <i class="bi bi-clock text-warning fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card border-success h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Réparations terminées</h6>
                  <h3 class="card-title mt-2">{{ stats.reparationsTerminees || 0 }}</h3>
                </div>
                <i class="bi bi-check-circle text-success fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col">
          <div class="card border-info h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Équipements actifs</h6>
                  <h3 class="card-title mt-2">{{ stats.equipementsActifs || 0 }}</h3>
                </div>
                <i class="bi bi-tools text-info fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-5">
        <div class="col">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Actions rapides</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3" *ngIf="user?.role === 'admin'">
                  <button class="btn btn-outline-primary w-100" routerLink="/reclamations/nouvelle">
                    <i class="bi bi-plus-circle me-2"></i>Nouvelle réclamation
                  </button>
                </div>
                <div class="col-md-3" *ngIf="user?.role === 'admin'">
                  <button class="btn btn-outline-primary w-100" routerLink="/equipements/nouveau">
                    <i class="bi bi-plus-circle me-2"></i>Nouvel équipement
                  </button>
                </div>
                <div class="col-md-3" *ngIf="user?.role === 'admin' || user?.role === 'technicien'">
                  <button class="btn btn-outline-primary w-100" routerLink="/reparations/nouvelle">
                    <i class="bi bi-wrench me-2"></i>Nouvelle réparation
                  </button>
                </div>
                <div class="col-md-3">
                  <button class="btn btn-outline-secondary w-100" routerLink="/profil">
                    <i class="bi bi-person me-2"></i>Mon profil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Récentes réclamations -->
      <div class="row">
        <div class="col-md-8">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Réclamations récentes</h5>
              <a routerLink="/reclamations" class="btn btn-sm btn-outline-primary">Voir tout</a>
            </div>
            <div class="card-body">
              <div class="table-responsive" *ngIf="recentReclamations.length > 0">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Équipement</th>
                      <th>Description</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of recentReclamations" [routerLink]="['/reclamations', r.id]" style="cursor: pointer;">
                      <td><strong>{{ r.numero }}</strong></td>
                      <td>{{ r.equipement_nom }}</td>
                      <td class="text-truncate" style="max-width: 200px;">{{ r.description }}</td>
                      <td>
                        <span [class]="'badge bg-' + getStatutColor(r.statut)">
                          {{ getStatutLabel(r.statut) }}
                        </span>
                      </td>
                      <td>{{ r.date_reclamation | date:'dd/MM/yyyy' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div *ngIf="recentReclamations.length === 0" class="text-center py-5">
                <i class="bi bi-clipboard-x fs-1 text-muted"></i>
                <p class="text-muted mt-3">Aucune réclamation récente</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Réparations récentes -->
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Réparations récentes</h5>
              <a routerLink="/reparations" class="btn btn-sm btn-outline-primary">Voir tout</a>
            </div>
            <div class="card-body">
              <div *ngIf="recentReparations.length > 0">
                <div class="list-group">
                  <div *ngFor="let r of recentReparations" class="list-group-item list-group-item-action" [routerLink]="['/reparations', r.id]">
                    <div class="d-flex w-100 justify-content-between">
                      <h6 class="mb-1">Rép. #{{ r.id }}</h6>
                      <small>{{ r.date_reparation | date:'dd/MM' }}</small>
                    </div>
                    <p class="mb-1 text-truncate">{{ r.actions }}</p>
                    <small class="text-muted">{{ r.equipement_nom }}</small>
                  </div>
                </div>
              </div>
              <div *ngIf="recentReparations.length === 0" class="text-center py-5">
                <i class="bi bi-wrench fs-1 text-muted"></i>
                <p class="text-muted mt-3">Aucune réparation récente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-role-badge .badge {
      font-size: 0.9rem;
      padding: 0.5em 1em;
    }
  `]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private reclamationService = inject(ReclamationService);
  private reparationService = inject(ReparationService);
  private equipementService = inject(EquipementService);

  user: any = null;
  recentReclamations: Reclamation[] = [];
  recentReparations: Reparation[] = [];
  stats = {
    reclamationsEnAttente: 0,
    reclamationsEnCours: 0,
    reparationsTerminees: 0,
    equipementsActifs: 0
  };

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.loadData();
  }

  loadData() {
    // Charger les réclamations récentes
    this.reclamationService.getAll().subscribe({
      next: (data) => {
        this.recentReclamations = data.slice(0, 5);
        this.stats.reclamationsEnAttente = data.filter(r => r.statut === 'en_attente').length;
        this.stats.reclamationsEnCours = data.filter(r => r.statut === 'en_cours').length;
      }
    });

    // Charger les réparations récentes
    this.reparationService.getAll().subscribe({
      next: (data) => {
        this.recentReparations = data.slice(0, 5);
        this.stats.reparationsTerminees = data.filter(r => r.statut === 'terminee').length;
      }
    });

    // Charger les équipements
    this.equipementService.getAll().subscribe({
      next: (data) => {
        this.stats.equipementsActifs = data.filter(e => e.actif).length;
      }
    });
  }

  getRoleBadgeClass(): string {
    switch (this.user?.role) {
      case 'admin': return 'bg-danger';
      case 'technicien': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en_attente': 'En attente',
      'en_cours': 'En cours',
      'traitee': 'Traitée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en_attente': 'warning',
      'en_cours': 'info',
      'traitee': 'success',
      'annulee': 'danger'
    };
    return colors[statut] || 'secondary';
  }
}
