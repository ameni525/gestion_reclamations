import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state text-center py-5">
      <div class="empty-state-icon mb-3">
        <i class="bi" [ngClass]="icon" [style.fontSize]="iconSize + 'rem'"></i>
      </div>
      <h4 class="empty-state-title mb-2">{{ title }}</h4>
      <p class="empty-state-text text-muted mb-4">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      color: #6c757d;
    }

    .empty-state-icon {
      color: #dee2e6;
    }

    .empty-state-title {
      font-weight: 600;
    }
  `]
})
export class EmptyStateComponent {
  @Input() title = 'Aucun élément trouvé';
  @Input() message = 'Commencez par ajouter un nouvel élément';
  @Input() icon = 'bi-inbox';
  @Input() iconSize = 3;
}
