import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);
  private cartService = inject(CartService);
  authService = inject(AuthService);

  product: Product | null = null;
  loading = false;
  deleteLoading = false;
  quantity = 1;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  loadProduct(id: string) {
    this.loading = true;
    this.cdr.markForCheck();
    this.productService.getProduct(id).subscribe({
      next: (res) => {
        this.product = res.product;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Product not found');
        this.cdr.markForCheck();
        this.router.navigate(['/products']);
      },
    });
  }

  deleteProduct() {
    if (!this.product) return;
    this.confirm.confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      confirmClass: 'danger',
    }).then((ok: boolean) => {
      if (!ok) return;
      this.deleteLoading = true;
      this.cdr.markForCheck();
      this.productService.deleteProduct(this.product!._id).subscribe({
        next: () => {
          this.toast.success('Product deleted successfully');
          this.router.navigate(['/products']);
        },
        error: () => {
          this.deleteLoading = false;
          this.toast.error('Failed to delete product');
          this.cdr.markForCheck();
        },
      });
    });
  }

  getStars(rating: number): { star: string; filled: boolean }[] {
    return Array(5).fill(null).map((_, i) => ({
      star: i < Math.floor(rating) ? '★' : '☆',
      filled: i < Math.floor(rating),
    }));
  }

  getImageUrl(image: string): string {
    if (!image) return 'https://placehold.co/600x500/f1f5f9/94a3b8?text=No+Image';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  incrementQty() { if (this.quantity < (this.product?.stock || 1)) this.quantity++; }
  decrementQty() { if (this.quantity > 1) this.quantity--; }

  addToCart(): void {
    if (!this.product || this.product.stock < 1) return;
    this.cartService.addItem(this.product, this.quantity);
    this.toast.success(`Added ${this.quantity} × ${this.product.name} to cart`);
  }
}
