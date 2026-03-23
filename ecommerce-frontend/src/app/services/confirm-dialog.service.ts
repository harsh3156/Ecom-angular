import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: 'primary' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly visible = signal(false);
  readonly options = signal<ConfirmOptions | null>(null);
  private resolveFn: ((value: boolean) => void) | null = null;

  confirm(options: ConfirmOptions | string): Promise<boolean> {
    const opts: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      this.resolveFn = resolve;
      this.options.set({
        title: opts.title ?? 'Confirm',
        message: opts.message,
        confirmText: opts.confirmText ?? 'Confirm',
        cancelText: opts.cancelText ?? 'Cancel',
        confirmClass: opts.confirmClass ?? 'danger',
      });
      this.visible.set(true);
    });
  }

  onConfirm() {
    if (this.resolveFn) this.resolveFn(true);
    this.resolveFn = null;
    this.visible.set(false);
    this.options.set(null);
  }

  onCancel() {
    if (this.resolveFn) this.resolveFn(false);
    this.resolveFn = null;
    this.visible.set(false);
    this.options.set(null);
  }
}
