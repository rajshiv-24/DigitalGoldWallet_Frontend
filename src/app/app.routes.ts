import { Routes }    from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Landing page (public, default) ───────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component')
        .then(m => m.LandingComponent)
  },

  // ── Public auth routes ────────────────────────────────────
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./auth/register/register.component')
        .then(m => m.RegisterComponent)
  },

  // ── Protected routes ──────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
  path: 'wallet',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./wallet/wallet.component')
      .then(m => m.WalletComponent)
},
{
  path: 'buy-gold',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./buy-gold/buy-gold.component')
      .then(m => m.BuyGoldComponent)
},
{
  path: 'sell-gold',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./sell-gold/sell-gold.component')
      .then(m => m.SellGoldComponent)
},

  {
  path: 'transactions',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./transactions/transactions.component')
      .then(m => m.TransactionsComponent)
},
{
  path: 'physical-gold',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./physical-gold/physical-gold.component')
      .then(m => m.PhysicalGoldComponent)
},
  // ── Wildcard ──────────────────────────────────────────────
  {
    path: '**',
    redirectTo: ''
  }
];