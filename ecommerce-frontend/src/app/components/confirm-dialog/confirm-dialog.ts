import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirmService.visible()) {
      <div class="dialog-backdrop" (click)="confirmService.onCancel()">
        <div class="dialog-box" (click)="$event.stopPropagation()">
          <h3 class="dialog-title">{{ confirmService.options()?.title ?? 'Confirm' }}</h3>
          <p class="dialog-message">{{ confirmService.options()?.message }}</p>
          <div class="dialog-actions">
            <button type="button" class="btn btn-secondary" (click)="confirmService.onCancel()">
              {{ confirmService.options()?.cancelText ?? 'Cancel' }}
            </button>
            <button
              type="button"
              [class]="'btn ' + (confirmService.options()?.confirmClass === 'danger' ? 'btn-danger' : 'btn-primary')"
              (click)="confirmService.onConfirm()"
            >
              {{ confirmService.options()?.confirmText ?? 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 24px;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .dialog-box {
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      animation: scaleIn 0.2s ease;
    }

    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .dialog-title {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .dialog-message {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  `],
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmDialogService);
}
