// src/app/modules/gestion-utilisateurs/components/utilisateur-details/utilisateur-details.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { Utilisateur } from '../../../../core/models/utilisateur.model';

@Component({
  selector: 'app-utilisateur-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h4 class="mb-0">
            <i class="bi bi-person me-2"></i>
            Détails de l'utilisateur
          </h4>
          <button class="btn btn-outline-secondary" routerLink="/utilisateurs">
            <i class="bi bi-arrow-left me-2"></i>Retour
          </button>
        </div>
        <div class="card-body">
          <div *ngIf="utilisateur" class="row">
            <div class="col-md-4 text-center">
              <div class="avatar-circle-lg bg-primary mb-3">
                {{ getInitials() }}
              </div>
              <h5>{{ utilisateur.nom }} {{ utilisateur.prenom }}</h5>
              <span [class]="'badge bg-' + getRoleColor(utilisateur.role)">
                {{ utilisateur.role_libelle }}
              </span>
            </div>
            <div class="col-md-8">
              <dl class="row">
                <dt class="col-sm-3">Email</dt>
                <dd class="col-sm-9">{{ utilisateur.email }}</dd>

                <dt class="col-sm-3">Téléphone</dt>
                <dd class="col-sm-9">{{ utilisateur.telephone || '-' }}</dd>

                <dt class="col-sm-3">Statut</dt>
                <dd class="col-sm-9">
                  <span [class]="'badge bg-' + (utilisateur.actif ? 'success' : 'danger')">
                    {{ utilisateur.actif ? 'Actif' : 'Inactif' }}
                  </span>
                </dd>

                <dt class="col-sm-3">Date création</dt>
                <dd class="col-sm-9">{{ utilisateur.created_at | date:'dd/MM/yyyy HH:mm' }}</dd>

                <dt class="col-sm-3">Dernière mise à jour</dt>
                <dd class="col-sm-9">{{ utilisateur.updated_at | date:'dd/MM/yyyy HH:mm' }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-circle-lg {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: bold;
      margin: 0 auto;
    }
  `]
})
export class UtilisateurDetailsComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private route = inject(ActivatedRoute);

  utilisateur: Utilisateur | null = null;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadUtilisateur(id);
    }
  }

  loadUtilisateur(id: number) {
    this.utilisateurService.getById(id).subscribe({
      next: (data) => {
        this.utilisateur = data;
      }
    });
  }

  getInitials(): string {
    if (!this.utilisateur) return '?';
    return `${this.utilisateur.prenom[0]}${this.utilisateur.nom[0]}`.toUpperCase();
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'admin': 'danger',
      'technicien': 'success'
    };
    return colors[role] || 'secondary';
  }
}
