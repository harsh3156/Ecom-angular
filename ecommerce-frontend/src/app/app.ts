import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { ToastComponent } from './components/toast/toast';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, ConfirmDialogComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-confirm-dialog></app-confirm-dialog>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class App {
  private authService = inject(AuthService);

  constructor() {
    // On every app load, re-validate the stored token against the server.
    // This prevents localStorage role-tampering (e.g. manually changing role to 'admin').
    this.authService.refreshUserFromServer();
  }
}
