import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="loading">
      <div class="loader-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <div class="mt-3">Chargement...</div>
      </div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loader-container {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
  `]
})
export class LoaderComponent {
  loading = false; // À implémenter avec un service de chargement
}
