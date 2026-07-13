import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Utilisateur } from '../../../../core/models/utilisateur.model';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="utilisateur-list">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="h4 mb-0"><i class="bi bi-people me-2 text-primary"></i>Gestion des Utilisateurs</h2>
          <p class="text-muted mb-0">Administration des comptes utilisateurs</p>
        </div>
        <button class="btn btn-primary" routerLink="/utilisateurs/nouveau">
          <i class="bi bi-person-plus me-2"></i>Nouvel utilisateur
        </button>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Rôle</label>
              <select class="form-select" [(ngModel)]="filters.role" (change)="applyFilters()">
                <option value="">Tous les rôles</option>
                <option value="admin">Administrateur</option>
                <option value="technicien">Technicien</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Statut</label>
              <select class="form-select" [(ngModel)]="filters.actif" (change)="applyFilters()">
                <option value="">Tous</option>
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label">Recherche</label>
              <input type="text" class="form-control" placeholder="Nom, prénom, email..."
                     [(ngModel)]="filters.search" (input)="applyFilters()">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button class="btn btn-outline-secondary w-100" (click)="refresh()" [disabled]="loading">
                <span *ngIf="!loading"><i class="bi bi-arrow-clockwise"></i> Actualiser</span>
                <span *ngIf="loading"><span class="spinner-border spinner-border-sm me-2"></span>Chargement...</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Nom & Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of filteredUtilisateurs">
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle-sm bg-primary me-2">
                        {{ getInitials(u) }}
                      </div>
                      <div>
                        <strong>{{ u.nom }} {{ u.prenom }}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{{ u.email }}</td>
                  <td>{{ u.telephone || '-' }}</td>
                  <td>
                    <span [class]="'badge bg-' + getRoleColor(u.role)">
                      {{ u.role_libelle }}
                    </span>
                  </td>
                  <td>
                    <span [class]="'badge bg-' + (u.actif ? 'success' : 'danger')">
                      {{ u.actif ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" [routerLink]="['/utilisateurs', u.id]">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-outline-warning" [routerLink]="['/utilisateurs/edit', u.id]">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger"
                              [disabled]="isCurrentUser(u)"
                              (click)="deleteUtilisateur(u)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredUtilisateurs.length === 0">
                  <td colspan="6" class="text-center py-5">
                    <i class="bi bi-people fs-1 text-muted d-block mb-2"></i>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <div class="text-muted">{{ filteredUtilisateurs.length }} utilisateur(s) trouvé(s)</div>
          <div class="text-muted"><small>Total: {{ utilisateurs.length }} utilisateurs</small></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-circle-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      font-weight: bold;
    }
  `]
})
export class UtilisateurListComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private authService = inject(AuthService);

  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  loading = false;
  currentUserId = this.authService.getCurrentUser()?.id;
  filters = {
    role: '',
    actif: '',
    search: ''
  };

  ngOnInit() {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(resetFilters = false) {
    if (resetFilters) {
      this.filters = { role: '', actif: '', search: '' };
    }

    this.loading = true;
    this.utilisateurService.getAll().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    this.filteredUtilisateurs = this.utilisateurs.filter(u => {
      const matchesRole = !this.filters.role || u.role === this.filters.role;
      const matchesActif = !this.filters.actif ||
        (this.filters.actif === '1' && !!u.actif) ||
        (this.filters.actif === '0' && !u.actif);
      const matchesSearch = !this.filters.search ||
        u.nom.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        u.prenom.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        u.email.toLowerCase().includes(this.filters.search.toLowerCase());

      return matchesRole && matchesActif && matchesSearch;
    });
  }

  refresh() {
    this.loadUtilisateurs(true);
  }

  deleteUtilisateur(utilisateur: Utilisateur) {
    if (this.isCurrentUser(utilisateur)) {
      return;
    }

    Swal.fire({
      title: 'Supprimer cet utilisateur ?',
      text: `${utilisateur.prenom} ${utilisateur.nom} ne pourra plus se connecter.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.utilisateurService.delete(utilisateur.id).subscribe({
        next: () => {
          Swal.fire('Supprimé', 'Utilisateur désactivé avec succès.', 'success');
          this.loadUtilisateurs();
        },
        error: (error) => {
          Swal.fire('Erreur', error?.message || 'Suppression impossible.', 'error');
        }
      });
    });
  }

  isCurrentUser(utilisateur: Utilisateur): boolean {
    return !!this.currentUserId && utilisateur.id === this.currentUserId;
  }

  getInitials(u: Utilisateur): string {
    return `${u.prenom[0]}${u.nom[0]}`.toUpperCase();
  }

  getRoleColor(role: string): string {
    const colors: { [key: string]: string } = {
      'admin': 'danger',
      'technicien': 'success'
    };
    return colors[role] || 'secondary';
  }
}
