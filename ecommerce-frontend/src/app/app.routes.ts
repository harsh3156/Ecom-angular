import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: '',
    loadComponent: () => import('./components/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./components/products/list/product-list').then((m) => m.ProductListComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./components/products/detail/product-detail').then((m) => m.ProductDetailComponent),
  },

  // User Routes (login required)
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./components/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'my-orders',
    canActivate: [authGuard],
    loadComponent: () => import('./components/my-orders/my-orders').then((m) => m.MyOrdersComponent),
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'products/add',
        loadComponent: () => import('./components/products/add-edit/product-add-edit').then((m) => m.ProductAddEditComponent),
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./components/products/add-edit/product-add-edit').then((m) => m.ProductAddEditComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/admin-orders/admin-orders').then((m) => m.AdminOrdersComponent),
      },
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
