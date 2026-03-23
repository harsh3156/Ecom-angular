import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, OrderStatus, OrdersResponse, OrderResponse } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  loading = true;
  updatingId: string | null = null;
  selectedFilter = 'all';
  expandedOrderId: string | null = null;

  readonly statuses: OrderStatus[] = ['pending', 'confirmed', 'dispatched', 'shipped', 'delivered'];

  readonly statusLabels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    dispatched: 'Dispatched',
    shipped: 'Shipped',
    delivered: 'Delivered',
  };

  readonly statusClasses: Record<OrderStatus, string> = {
    pending: 'badge-warning',
    confirmed: 'badge-primary',
    dispatched: 'badge-primary',
    shipped: 'badge-primary',
    delivered: 'badge-success',
  };

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading = true;
    this.cdr.markForCheck();
    this.orderService.getAllOrders(this.selectedFilter).subscribe({
      next: (res: OrdersResponse) => {
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

  onFilterChange() { this.loadOrders(); }

  toggleExpand(id: string) {
    this.expandedOrderId = this.expandedOrderId === id ? null : id;
  }

  updateStatus(order: Order, newStatus: string) {
    if (!this.statuses.includes(newStatus as OrderStatus)) return;
    const status = newStatus as OrderStatus;
    if (order.status === status) return;

    this.updatingId = order._id;
    this.cdr.markForCheck();
    this.orderService.updateOrderStatus(order._id, status).subscribe({
      next: (res: OrderResponse) => {
        const idx = this.orders.findIndex((o: Order) => o._id === order._id);
        if (idx !== -1) this.orders[idx] = res.order;
        this.updatingId = null;
        this.toast.success(`Order status updated to "${this.statusLabels[status]}"`);
        this.cdr.markForCheck();
      },
      error: (err: { error?: { message?: string } }) => {
        this.toast.error(err.error?.message || 'Failed to update status');
        this.updatingId = null;
        this.cdr.markForCheck();
      },
    });
  }

  getImageUrl(image: string): string {
    if (!image) return 'https://placehold.co/46x46/f1f5f9/94a3b8?text=?';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000${image}`;
  }

  getUserName(order: Order): string {
    if (typeof order.user === 'object' && order.user !== null) {
      return (order.user as { name: string; email: string }).name;
    }
    return 'Unknown';
  }

  getUserEmail(order: Order): string {
    if (typeof order.user === 'object' && order.user !== null) {
      return (order.user as { name: string; email: string }).email;
    }
    return '';
  }
}
