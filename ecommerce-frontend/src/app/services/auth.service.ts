import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoggedIn = signal<boolean>(!!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  register(data: { name: string; email: string; password: string; role?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => this.setSession(res))
    );
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((res) => this.setSession(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  // Re-validates the current session against the server.
  // Call this on app startup to prevent localStorage role-tampering attacks.
  refreshUserFromServer(): void {
    if (!this.getToken()) return;
    this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).pipe(
      catchError(() => {
        // Token invalid or expired — clear local session
        this.logout();
        return of(null);
      })
    ).subscribe((res) => {
      if (res?.success && res.user) {
        // Always trust the server's role, not localStorage
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
        this.isLoggedIn.set(true);
      }
    });
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
