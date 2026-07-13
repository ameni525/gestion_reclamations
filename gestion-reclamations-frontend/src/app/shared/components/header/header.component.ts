import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="container-fluid">
        <div class="d-flex align-items-center justify-content-between py-2">
          <div class="d-flex align-items-center">
            <div class="header-logo">
              <img src="assets/images/sofima-logo.png" alt="SOFIMA Filters" class="brand-logo me-2">
              <span class="fw-bold">SOFIMA</span>
              <span class="text-muted ms-1">Réclamations</span>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <div class="user-info me-3">
              <small class="d-block fw-bold">{{ user?.prenom }} {{ user?.nom }}</small>
              <small class="text-muted">{{ user?.role_libelle }}</small>
            </div>
            <div class="dropdown">
              <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button"
                      (click)="toggleAccountMenu($event)">
                <i class="bi bi-person-circle me-1"></i>Compte
              </button>
              <ul class="dropdown-menu dropdown-menu-end" [class.show]="accountMenuOpen" (click)="$event.stopPropagation()">
                <li><a class="dropdown-item" routerLink="/profil">Mon profil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" (click)="logout()">
                  <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
                </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      border-bottom: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0,0,0,.05);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1030;
      height: 60px;
    }
    .header-logo {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
    }
    .brand-logo {
      width: 34px;
      height: 34px;
      object-fit: contain;
    }
    .user-info {
      text-align: right;
    }
    .dropdown-menu.show {
      display: block;
    }
  `]
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  user = this.authService.getCurrentUser();
  accountMenuOpen = false;

  toggleAccountMenu(event: Event) {
    event.stopPropagation();
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.accountMenuOpen = false;
    }
  }

  logout() {
    this.accountMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
