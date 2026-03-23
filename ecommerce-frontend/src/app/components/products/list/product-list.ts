import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ConfirmDialogService } from '../../../services/confirm-dialog.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmDialogService);
  private cartService = inject(CartService);
  authService = inject(AuthService);

  products: Product[] = [];
  categories: string[] = [];
  loading = false;
  deleteLoading: string | null = null;

  searchTerm = '';
  selectedCategory = 'all';
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  sortBy = '-createdAt';

  sortOptions = [
    { label: 'Newest First', value: '-createdAt' },
    { label: 'Oldest First', value: 'createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Name A-Z', value: 'name' },
  ];

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.categories;
        this.cdr.markForCheck();
      },
      error: () => this.toast.error('Failed to load categories'),
    });
  }

  loadProducts() {
    this.loading = true;
    this.cdr.markForCheck();
    this.productService.getProducts({
      category: this.selectedCategory === 'all' ? undefined : this.selectedCategory,
      search: this.searchTerm || undefined,
      page: this.currentPage,
      sort: this.sortBy,
    }).subscribe({
      next: (res) => {
        this.products = res.products;
        this.totalPages = res.pages;
        this.totalProducts = res.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange(cat: string) {
    this.selectedCategory = cat;
    this.currentPage = 1;
    this.loadProducts();
  }

  onSortChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  deleteProduct(id: string, event: Event) {
    event.stopPropagation();
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
          this.loadProducts();
        },
        error: () => {
          this.deleteLoading = null;
          this.toast.error('Failed to delete product');
          this.cdr.markForCheck();
        },
      });
    });
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < Math.floor(rating) ? '★' : '☆');
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
