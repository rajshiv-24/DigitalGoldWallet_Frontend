import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  AuthResponse,
  AuthenticatedUser
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly authUrl = `${environment.apiBaseUrl}/api/auth`;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY  = 'auth_user';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  // ─────────────────────────────────────────────────────────
  // POST /api/auth/register
  // Body    : UserRequestDTO  (RegisterRequest)
  // Returns : UserResponseDTO (RegisterResponse) — HTTP 201
  // ─────────────────────────────────────────────────────────
  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.authUrl}/register`,
      payload
    );
  }

  // ─────────────────────────────────────────────────────────
  // POST /api/auth/login
  // Body    : LoginRequestDTO  (LoginRequest)
  // Returns : AuthResponseDTO  (AuthResponse) — HTTP 200
  // Stores JWT token and user data in localStorage on success
  // ─────────────────────────────────────────────────────────
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.authUrl}/login`,
      payload
    ).pipe(
      tap((response: AuthResponse) => {
        // response.message carries the raw JWT token
        const sessionUser: AuthenticatedUser = {
          token:  response.message,
          userId: response.userId,
          name:   response.name,
          email:  response.email,
          role:   response.role
        };
        this.storeSession(sessionUser);
      })
    );
  }

  // ─────────────────────────────────────────────────────────
  // Clears localStorage and redirects to login
  // ─────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  // ─────────────────────────────────────────────────────────
  // Returns raw JWT token string or null
  // ─────────────────────────────────────────────────────────
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ─────────────────────────────────────────────────────────
  // Returns the full AuthenticatedUser object or null
  // ─────────────────────────────────────────────────────────
  getAuthenticatedUser(): AuthenticatedUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Returns true if a valid, non-expired token exists
  // ─────────────────────────────────────────────────────────
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // ─────────────────────────────────────────────────────────
  // Returns the role string from stored session
  // ─────────────────────────────────────────────────────────
  getRole(): string | null {
    return this.getAuthenticatedUser()?.role ?? null;
  }

  // ─────────────────────────────────────────────────────────
  // Stores token and user object separately in localStorage
  // ─────────────────────────────────────────────────────────
  private storeSession(user: AuthenticatedUser): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // ─────────────────────────────────────────────────────────
  // Decodes JWT payload and checks expiry (exp claim)
  // ─────────────────────────────────────────────────────────
  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      const nowInSeconds = Math.floor(Date.now() / 1000);
      return decoded.exp < nowInSeconds;
    } catch {
      return true; // Treat malformed token as expired
    }
  }
}