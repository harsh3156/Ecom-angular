import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order, OrderStatus } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  loading = true;
  expandedOrderId: string | null = null;

  readonly statusSteps: OrderStatus[] = ['pending', 'confirmed', 'dispatched', 'shipped', 'delivered'];

  readonly statusLabels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    dispatched: 'Dispatched',
    shipped: 'Shipped',
    delivered: 'Delivered',
  };

  readonly statusIcons: Record<OrderStatus, string> = {
    pending: '🕐',
    confirmed: '✅',
    dispatched: '📦',
    shipped: '🚚',
    delivered: '🎉',
  };

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading = true;
    this.cdr.markForCheck();
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.orders;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to load orders');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  toggleExpand(id: string) {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  getImageUrl(image: string): string {
    if (!image) return 'https://placehold.co/50x50/f1f5f9/94a3b8?text=?';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  getStepIndex(status: OrderStatus): number {
    return this.statusSteps.indexOf(status);
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'badge-warning',
      confirmed: 'badge-primary',
      dispatched: 'badge-primary',
      shipped: 'badge-primary',
      delivered: 'badge-success',
    };
    return map[status] || 'badge-gray';
  }
}
