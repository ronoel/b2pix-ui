import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'request-invite',
    loadComponent: () => import('./pages/request-invite/request-invite.component').then(m => m.RequestInviteComponent)
  },
  {
    path: 'pending-approval',
    loadComponent: () => import('./pages/pending-approval/pending-approval.component').then(m => m.PendingApprovalComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'buy',
    loadComponent: () => import('./pages/buy/buy.component').then(m => m.BuyComponent)
  },
  {
    path: 'sell',
    loadComponent: () => import('./pages/sell/sell.component').then(m => m.SellComponent)
  },
  {
    path: 'pix-account',
    loadComponent: () => import('./pages/pix-account/pix-account.component').then(m => m.PixAccountComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
