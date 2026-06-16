import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  WalletTopUpRequest,
  PaymentResponse
} from '../models/wallet.models';
import { UserResponse } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class WalletService {

  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  // ── POST /api/users/wallet/top-up ─────────────────────────
  // Bearer token is attached automatically by JwtInterceptor.
  // userId is injected from AuthService by the component —
  // it is never entered by the user.
  topUpWallet(payload: WalletTopUpRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.baseUrl}/api/users/wallet/top-up`,
      payload
    );
  }

  // ── GET /api/users/{userId} ───────────────────────────────
  // Re-used here to refresh the displayed balance after a
  // successful top-up without importing DashboardService.
  getUserById(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.baseUrl}/api/users/${userId}`
    );
  }
}