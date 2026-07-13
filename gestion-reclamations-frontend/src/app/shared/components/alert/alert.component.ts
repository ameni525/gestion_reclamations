// src/app/shared/components/alert/alert.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert" [ngClass]="typeClass" role="alert">
      <div class="d-flex align-items-center">
        <i class="bi me-2" [ngClass]="iconClass"></i>
        <div>
          <strong *ngIf="title">{{ title }}</strong>
          {{ message }}
          <ng-content></ng-content>
        </div>
      </div>
      <button *ngIf="dismissible" type="button" class="btn-close"
              (click)="dismiss()" aria-label="Close"></button>
    </div>
  `,
  styles: [`
    .alert {
      border-radius: 8px;
      border: none;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class AlertComponent {
  @Input() type: 'success' | 'danger' | 'warning' | 'info' = 'info';
  @Input() title?: string;
  @Input() message?: string;
  @Input() dismissible = false;

  visible = true;

  get typeClass(): string {
    return `alert-${this.type}`;
  }

  get iconClass(): string {
    const icons = {
      'success': 'bi-check-circle-fill',
      'danger': 'bi-exclamation-circle-fill',
      'warning': 'bi-exclamation-triangle-fill',
      'info': 'bi-info-circle-fill'
    };
    return icons[this.type];
  }

  dismiss(): void {
    this.visible = false;
  }
}
