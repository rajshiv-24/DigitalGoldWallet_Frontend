import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { Router, RouterLink }           from '@angular/router';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AuthService }                  from '../core/services/auth.services';
import { DashboardService }             from '../core/services/dashboard.service';
import {
  UserResponse,
  GoldHoldingTotal,
  TransactionHistoryResponse
} from '../core/models/dashboard.models';

@Component({
  selector:    'app-dashboard',
  standalone:  true,
  imports:     [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls:   ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // ── UI state ──────────────────────────────────────────────
  isSidebarOpen = false;
  isLoading     = true;
  errorMessage: string | null = null;

  // ── API data ──────────────────────────────────────────────
  userProfile:    UserResponse                  | null = null;
  goldHolding:    GoldHoldingTotal              | null = null;
  transactions:   TransactionHistoryResponse[]        = [];

  // ── Mock: gold rate remains hardcoded until
  //         a price endpoint exists on the backend ──────────
  readonly currentRatePerGram = 6748.50;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService:      AuthService,
    private readonly dashboardService: DashboardService,
    private readonly router:           Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getAuthenticatedUser();

    if (!session) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadDashboardData(session.userId);
  }

  // ── Parallel API calls via forkJoin ───────────────────────
  private loadDashboardData(userId: number): void {
    this.isLoading    = true;
    this.errorMessage = null;

    forkJoin({
      user:         this.dashboardService.getUserById(userId),
      goldHolding:  this.dashboardService.getGoldHoldingTotal(userId),
      transactions: this.dashboardService.getTransactionHistory(userId)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ user, goldHolding, transactions }) => {
        this.userProfile  = user;
        this.goldHolding  = goldHolding;
        this.transactions = transactions;
        this.isLoading    = false;
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // ── Derived display values ────────────────────────────────

  /** Full name from live API, falls back to JWT session name */
  get displayName(): string {
    return this.userProfile?.name
      ?? this.authService.getAuthenticatedUser()?.name
      ?? 'User';
  }

  /** Wallet balance from UserResponseDTO.balance */
  get walletBalance(): number {
    return this.userProfile?.balance ?? 0;
  }

  /** Total gold grams from holdings endpoint */
  get totalGoldGrams(): number {
    return this.goldHolding?.totalQuantity ?? 0;
  }

  /** Portfolio value = totalQuantity × mock rate */
  get portfolioValue(): number {
    return this.totalGoldGrams * this.currentRatePerGram;
  }

  /** Two-letter initials from displayName */
  getUserInitials(): string {
    return this.displayName
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // ── Sidebar helpers ───────────────────────────────────────
  toggleSidebar(): void  { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar():  void  { this.isSidebarOpen = false; }

  logout(): void { this.authService.logout(); }

  // ── Transaction table helpers ─────────────────────────────

  /**
   * Maps transactionStatus string → Bootstrap badge CSS class.
   * Backend values are not yet confirmed beyond the field name;
   * we normalise to uppercase for comparison.
   */
  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':   return 'badge-success';
      case 'PENDING':   return 'badge-pending';
      case 'FAILED':    return 'badge-failed';
      default:          return 'badge-pending';
    }
  }

  /**
   * Maps transactionType string → pill CSS class.
   * Backend values are not yet confirmed; normalise to uppercase.
   */
  getTypeClass(type: string): string {
    switch (type?.toUpperCase()) {
      case 'BUY':    return 'type-buy';
      case 'SELL':   return 'type-sell';
      case 'CREDIT': return 'type-credit';
      case 'DEBIT':  return 'type-debit';
      default:       return 'type-buy';
    }
  }

  /** Prefix sign for amount column */
  getAmountSign(type: string): string {
    const t = type?.toUpperCase();
    return (t === 'BUY' || t === 'DEBIT') ? '−' : '+';
  }

  /** Limit transactions table to most recent 5 rows */
  get recentTransactions(): TransactionHistoryResponse[] {
    return this.transactions.slice(0, 5);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}