import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  rating: number;
  numReviews: number;
  createdAt: string;
}

export interface ProductsResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  products: Product[];
}

export interface ProductResponse {
  success: boolean;
  product: Product;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  getProducts(filters: { category?: string; search?: string; page?: number; limit?: number; sort?: string } = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.sort) params = params.set('sort', filters.sort);
    return this.http.get<ProductsResponse>(this.apiUrl, { params });
  }

  getProduct(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.apiUrl}/${id}`);
  }

  createProduct(formData: FormData): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.apiUrl, formData);
  }

  updateProduct(id: string, formData: FormData): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<{ success: boolean; categories: string[] }> {
    return this.http.get<{ success: boolean; categories: string[] }>(`${this.apiUrl}/categories/all`);
  }
}
