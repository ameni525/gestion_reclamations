import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop fade show" *ngIf="visible"></div>
    <div class="modal fade show" [class.show]="visible" tabindex="-1"
         [style.display]="visible ? 'block' : 'none'">
      <div class="modal-dialog" [class.modal-lg]="large" [class.modal-sm]="small">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          <div class="modal-footer" *ngIf="showFooter">
            <button type="button" class="btn btn-secondary" (click)="close()">
              {{ cancelText }}
            </button>
            <button type="button" class="btn btn-primary" (click)="confirm()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal.show {
      display: block;
    }

    .modal-backdrop.show {
      opacity: 0.5;
    }
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Input() visible = false;
  @Input() large = false;
  @Input() small = false;
  @Input() showFooter = true;
  @Input() cancelText = 'Annuler';
  @Input() confirmText = 'Confirmer';

  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmModal = new EventEmitter<void>();

  close(): void {
    this.visible = false;
    this.closeModal.emit();
  }

  confirm(): void {
    this.confirmModal.emit();
    this.close();
  }

  open(): void {
    this.visible = true;
  }
}
