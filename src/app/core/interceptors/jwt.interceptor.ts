import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.services';
import { environment } from '../../../environments/environment';

// ── Endpoints that must never receive a Bearer token ─────
const AUTH_EXCLUDED_PATHS: string[] = [
  '/api/auth/login',
  '/api/auth/register'
];

function isExcluded(url: string): boolean {
  return AUTH_EXCLUDED_PATHS.some(path => url.includes(path));
}

function isApiRequest(url: string): boolean {
  return url.startsWith(environment.apiBaseUrl);
}

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const authService = inject(AuthService);

  // Only attach token to requests going to our own backend
  // and never to login / register endpoints
  if (!isApiRequest(req.url) || isExcluded(req.url)) {
    return next(req);
  }

  const token = authService.getToken();

  if (!token) {
    return next(req);
  }

  const authorizedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authorizedRequest);
};