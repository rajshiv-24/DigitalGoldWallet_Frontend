import { Injectable }        from '@angular/core';
import { HttpClient }        from '@angular/common/http';
import { Observable }        from 'rxjs';
import { environment }       from '../../../environments/environment';
import {
  UserResponse,
  GoldHoldingTotal,
  TransactionHistoryResponse
} from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  // ── GET /api/users/{userId} ───────────────────────────────
  getUserById(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${this.baseUrl}/api/users/${userId}`
    );
  }

  // ── GET /api/gold/holdings/by-user/{userId}/total ─────────
  getGoldHoldingTotal(userId: number): Observable<GoldHoldingTotal> {
    return this.http.get<GoldHoldingTotal>(
      `${this.baseUrl}/api/gold/holdings/by-user/${userId}/total`
    );
  }

  // ── GET /api/gold/history/by-user/{userId} ────────────────
  getTransactionHistory(userId: number): Observable<TransactionHistoryResponse[]> {
    return this.http.get<TransactionHistoryResponse[]>(
      `${this.baseUrl}/api/gold/history/by-user/${userId}`
    );
  }
}