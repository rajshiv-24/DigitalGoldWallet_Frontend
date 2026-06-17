import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorBranch } from '../models/vendor-branch.model';
import { BuyGoldRequest, SellGoldRequest, TransactionHistoryResponse } from '../models/transaction-history.model';

@Injectable({ providedIn: 'root' })
export class GoldTransactionService {
  private readonly goldUrl = 'http://localhost:8080/api/gold';
  private readonly branchUrl = 'http://localhost:8080/api/branches';

  constructor(private http: HttpClient) {}

  getAllBranches(): Observable<VendorBranch[]> {
    return this.http.get<VendorBranch[]>(this.branchUrl);
  }

  buyGold(request: BuyGoldRequest): Observable<TransactionHistoryResponse> {
    return this.http.post<TransactionHistoryResponse>(`${this.goldUrl}/buy`, request);
  }

  getTransactionHistoryByUser(userId: number): Observable<TransactionHistoryResponse[]> {
    return this.http.get<TransactionHistoryResponse[]>(`${this.goldUrl}/history/by-user/${userId}`);
  }

  sellGold(request: SellGoldRequest): Observable<TransactionHistoryResponse> {
  return this.http.post<TransactionHistoryResponse>(
    `${this.goldUrl}/sell`,
    request
  );
}
}