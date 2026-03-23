import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;

  form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
    street: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zip: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z\s\-]{3,10}$/)]],
    country: ['India', Validators.required],
  });

  get f() { return this.form.controls; }

  getImageUrl(image: string): string {
    if (!image) return 'https://placehold.co/60x60/f1f5f9/94a3b8?text=?';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.cartService.cartCount() === 0) {
      this.toast.warning('Your cart is empty');
      this.router.navigate(['/products']);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    const payload = {
      items: this.cartService.cartItems().map(i => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      shippingAddress: this.form.value,
    };

    this.orderService.placeOrder(payload).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.loading = false;
        this.toast.success('Order placed successfully! 🎉');
        this.router.navigate(['/my-orders']);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to place order. Please try again.');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
