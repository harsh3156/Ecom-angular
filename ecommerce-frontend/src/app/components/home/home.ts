import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private cartService = inject(CartService);
  authService = inject(AuthService);

  featuredProducts: Product[] = [];
  loading = false;

  features = [
    { icon: '🚀', title: 'Fast Delivery', desc: 'Get your orders delivered within 2-3 business days' },
    { icon: '🔒', title: 'Secure Payment', desc: '100% secure payment with end-to-end encryption' },
    { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free return policy' },
    { icon: '🎧', title: '24/7 Support', desc: 'Our team is always ready to help you' },
  ];

  ngOnInit() {
    this.loading = true;
    this.cdr.markForCheck();
    this.productService.getProducts({ limit: 8, sort: '-createdAt' }).subscribe({
      next: (res) => {
        this.featuredProducts = res.products;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load products');
        this.cdr.markForCheck();
      },
    });
  }

  getStars(rating: number): { filled: boolean }[] {
    return Array(5).fill(null).map((_, i) => ({ filled: i < Math.floor(rating) }));
  }

  getImageUrl(image: string): string {
    if (!image) return 'https://placehold.co/300x300/f1f5f9/94a3b8?text=No+Image';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (product.stock < 1) return;
    this.cartService.addItem(product, 1);
    this.toast.success(`Added ${product.name} to cart`);
    this.cdr.markForCheck();
  }
}
