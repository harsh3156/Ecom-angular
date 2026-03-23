import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);
  authService = inject(AuthService);

  products: Product[] = [];
  loading = false;
  deleteLoading: string | null = null;
  totalProducts = 0;
  outOfStock = 0;
  lowStock = 0;
  categories: string[] = [];

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.cdr.markForCheck();
    this.productService.getProducts({ limit: 100 }).subscribe({
      next: (res) => {
        this.products = res.products;
        this.totalProducts = res.total;
        this.outOfStock = res.products.filter((p) => p.stock === 0).length;
        this.lowStock = res.products.filter((p) => p.stock > 0 && p.stock <= 5).length;
        this.categories = [...new Set(res.products.map((p) => p.category))];
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

  deleteProduct(id: string) {
    this.confirm.confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      confirmClass: 'danger',
    }).then((ok) => {
      if (!ok) return;
      this.deleteLoading = id;
      this.cdr.markForCheck();
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.deleteLoading = null;
          this.toast.success('Product deleted successfully');
          this.loadDashboardData();
        },
        error: () => {
          this.deleteLoading = null;
          this.toast.error('Failed to delete product');
          this.cdr.markForCheck();
        },
      });
    });
  }

  getImageUrl(image: string): string {
    if (!image) return 'https://placehold.co/60x60/f1f5f9/94a3b8?text=?';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  getStockBadge(stock: number): { class: string; label: string } {
    if (stock === 0) return { class: 'badge-danger', label: 'Out of Stock' };
    if (stock <= 5) return { class: 'badge-warning', label: `Low (${stock})` };
    return { class: 'badge-success', label: `${stock} units` };
  }
}
