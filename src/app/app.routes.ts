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
  
  // ── Wildcard ──────────────────────────────────────────────
  {
    path: '**',
    redirectTo: ''
  }
];