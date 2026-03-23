import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent {
  cartService = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  getImageUrl(image: string): string {
    if (!image) return 'https://placehold.co/80x80/f1f5f9/94a3b8?text=No+Image';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  updateQty(productId: string, delta: number): void {
    const item = this.cartService.getItem(productId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      this.cartService.removeItem(productId);
      this.toast.info('Item removed from cart');
    } else {
      this.cartService.updateQuantity(productId, newQty);
    }
    this.cdr.markForCheck();
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
    this.toast.info('Item removed from cart');
    this.cdr.markForCheck();
  }

  checkout(): void {
    if (this.cartService.cartCount() === 0) {
      this.toast.warning('Your cart is empty');
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to proceed to checkout');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
