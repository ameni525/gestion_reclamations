import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { SidebarComponent } from '../../modules/dashboard/components/sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="layout-wrapper" *ngIf="isAuthenticated; else loginRedirect">
      <app-header></app-header>
      <div class="layout-container">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <div class="container-fluid py-4">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
    <ng-template #loginRedirect>
      <div class="loading-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <div class="mt-3">Redirection vers la page de connexion...</div>
      </div>
    </ng-template>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .layout-container {
      display: flex;
      flex: 1;
      margin-top: 60px; 
    }
    .main-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      margin-left: 250px; 
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated = false;

  ngOnInit() {
    this.checkAuthentication();
  }

  checkAuthentication() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) {
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 1000);
    }
  }
}
