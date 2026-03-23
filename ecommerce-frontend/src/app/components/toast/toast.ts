import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.items(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button type="button" class="toast-close" (click)="toastService.dismiss(toast.id); $event.stopPropagation()" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      cursor: pointer;
      animation: slideIn 0.3s ease;
      font-size: 14px;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .toast-success { background: #10b981; color: white; }
    .toast-error { background: #ef4444; color: white; }
    .toast-info { background: #6366f1; color: white; }
    .toast-warning { background: #f59e0b; color: white; }

    .toast-icon { font-size: 18px; flex-shrink: 0; }
    .toast-message { flex: 1; font-weight: 500; }
    .toast-close {
      flex-shrink: 0;
      padding: 4px;
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .toast-close:hover { background: rgba(255,255,255,0.3); }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠',
    };
    return icons[type] ?? '•';
  }
}
