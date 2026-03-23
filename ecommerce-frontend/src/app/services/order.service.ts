import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'shipped' | 'delivered';

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  order: Order;
}

export interface OrdersResponse {
  success: boolean;
  total?: number;
  orders: Order[];
}

export interface PlaceOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:5000/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(payload: PlaceOrderPayload): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, payload);
  }

  getMyOrders(): Observable<OrdersResponse> {
    return this.http.get<OrdersResponse>(`${this.apiUrl}/my`);
  }

  getAllOrders(status?: string, page = 1): Observable<OrdersResponse> {
    let url = `${this.apiUrl}?page=${page}&limit=50`;
    if (status && status !== 'all') url += `&status=${status}`;
    return this.http.get<OrdersResponse>(url);
  }

  getOrder(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.apiUrl}/${id}/status`, { status });
  }
}
