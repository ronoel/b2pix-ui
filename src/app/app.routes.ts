import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { validateInviteGuard } from './core/guards/validate-invite.guard';

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
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'buy',
    loadComponent: () => import('./pages/buy/buy.component').then(m => m.BuyComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sell',
    loadComponent: () => import('./pages/sell/sell.component').then(m => m.SellComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pix-account',
    loadComponent: () => import('./pages/pix-account/pix-account.component').then(m => m.PixAccountComponent),
    canActivate: [authGuard]
  },
  {
    path: 'invite-validation',
    loadComponent: () => import('./pages/invite-validation/invite-validation.component').then(m => m.InviteValidationComponent),
    canActivate: [validateInviteGuard]
  },
  {
    path: 'blocked',
    loadComponent: () => import('./pages/blocked/blocked.component').then(m => m.BlockedComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
