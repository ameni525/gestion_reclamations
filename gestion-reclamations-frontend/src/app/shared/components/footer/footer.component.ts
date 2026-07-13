// src/app/shared/components/footer/footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer mt-auto py-3 bg-light border-top">
      <div class="container-fluid">
        <div class="row align-items-center">
          <div class="col-md-6">
            <span class="text-muted">
              © {{ currentYear }} SOFIMA FILTERS - Gestion des Réclamations v1.0.0
            </span>
          </div>
          <div class="col-md-6 text-md-end">
            <span class="text-muted">
              Développé avec <i class="bi bi-heart-fill text-danger"></i> par ISET Rades
            </span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      font-size: 0.875rem;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
