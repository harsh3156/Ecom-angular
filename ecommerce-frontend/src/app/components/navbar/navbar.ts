import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  mobileMenuOpen = false;

  toggleMobile() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.mobileMenuOpen = false;
  }
}
