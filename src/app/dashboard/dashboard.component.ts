import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../core/services/auth.services';
import { AuthenticatedUser } from '../core/models/auth.models';

interface WalletBalance {
  totalValueInr: number;
  availableValueInr: number;
  lockedValueInr: number;
}

interface GoldHolding {
  totalGrams: number;
  availableGrams: number;
  lockedGrams: number;
  currentRatePerGram: number;
}

interface RecentTransaction {
  id: number;
  date: string;
  type: 'BUY' | 'SELL' | 'CREDIT' | 'DEBIT';
  description: string;
  grams: number | null;
  amountInr: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  currentUser: AuthenticatedUser | null = null;
  isSidebarOpen = false;

  // ── Mock data — replace with API calls when backend is ready ──

  walletBalance: WalletBalance = {
    totalValueInr: 124500.00,
    availableValueInr: 98750.00,
    lockedValueInr: 25750.00
  };

  goldHolding: GoldHolding = {
    totalGrams: 18.450,
    availableGrams: 14.200,
    lockedGrams: 4.250,
    currentRatePerGram: 6748.50
  };

  recentTransactions: RecentTransaction[] = [
    {
      id: 1001,
      date: '2024-06-14',
      type: 'BUY',
      description: 'Gold purchase',
      grams: 2.000,
      amountInr: 13497.00,
      status: 'SUCCESS'
    },
    {
      id: 1002,
      date: '2024-06-12',
      type: 'CREDIT',
      description: 'Wallet top-up',
      grams: null,
      amountInr: 25000.00,
      status: 'SUCCESS'
    },
    {
      id: 1003,
      date: '2024-06-10',
      type: 'SELL',
      description: 'Gold sale',
      grams: 1.500,
      amountInr: 10122.75,
      status: 'SUCCESS'
    },
    {
      id: 1004,
      date: '2024-06-08',
      type: 'BUY',
      description: 'Gold purchase',
      grams: 0.500,
      amountInr: 3374.25,
      status: 'PENDING'
    },
    {
      id: 1005,
      date: '2024-06-05',
      type: 'DEBIT',
      description: 'Withdrawal',
      grams: null,
      amountInr: 10000.00,
      status: 'FAILED'
    }
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();
  }

  getUserInitials(): string {
    const name = this.currentUser?.name ?? '';
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  getTransactionBadgeClass(status: RecentTransaction['status']): string {
    const map: Record<RecentTransaction['status'], string> = {
      SUCCESS: 'badge-success',
      PENDING: 'badge-pending',
      FAILED:  'badge-failed'
    };
    return map[status];
  }

  getTransactionTypeClass(type: RecentTransaction['type']): string {
    const map: Record<RecentTransaction['type'], string> = {
      BUY:    'type-buy',
      SELL:   'type-sell',
      CREDIT: 'type-credit',
      DEBIT:  'type-debit'
    };
    return map[type];
  }

  getAmountSign(type: RecentTransaction['type']): string {
    return (type === 'BUY' || type === 'DEBIT') ? '−' : '+';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}