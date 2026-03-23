import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product.service';

const CART_STORAGE_KEY = 'shopease_cart';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>(this.loadFromStorage());

  readonly cartItems = computed(() => this.items());
  readonly cartCount = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly cartTotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  private loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items()));
  }

  addItem(product: Product, quantity: number = 1): void {
    const existing = this.items().find((i) => i.productId === product._id);
    const newQty = (existing?.quantity ?? 0) + quantity;
    const maxQty = Math.min(newQty, product.stock);

    if (maxQty <= 0) return;

    const updated = existing
      ? this.items().map((i) =>
          i.productId === product._id
            ? { ...i, quantity: maxQty, stock: product.stock }
            : i
        )
      : [
          ...this.items(),
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: maxQty,
            stock: product.stock,
          },
        ];

    this.items.set(updated);
    this.saveToStorage();
  }

  removeItem(productId: string): void {
    this.items.set(this.items().filter((i) => i.productId !== productId));
    this.saveToStorage();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }
    this.items.set(
      this.items().map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      )
    );
    this.saveToStorage();
  }

  clearCart(): void {
    this.items.set([]);
    this.saveToStorage();
  }

  getItem(productId: string): CartItem | undefined {
    return this.items().find((i) => i.productId === productId);
  }
}
