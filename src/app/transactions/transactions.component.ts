import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.services';
import { GoldTransactionService } from '../core/services/gold-transaction.service';
import { TransactionHistoryResponse , TransactionStatus , TransactionType2} from '../core/models/transaction-history.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  allTransactions: TransactionHistoryResponse[] = [];
  filteredTransactions: TransactionHistoryResponse[] = [];

  isLoading = false;
  errorMessage = '';

  selectedType: TransactionType2 | 'ALL' = 'ALL';
  selectedStatus: TransactionStatus | 'ALL' = 'ALL';

  readonly typeOptions: (TransactionType2 | 'ALL')[] = [
    'ALL', 'BUY', 'SELL', 'CONVERT_TO_PHYSICAL'
  ];

  readonly statusOptions: (TransactionStatus | 'ALL')[] = [
    'ALL', 'SUCCESS', 'FAILED'
  ];

  constructor(
    private goldService: GoldTransactionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const session = this.authService.getAuthenticatedUser();
    if (!session) return;
    const userId = session.userId;
    this.loadTransactions(userId);
  }

  private loadTransactions(userId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.goldService.getTransactionHistoryByUser(userId).subscribe({
      next: (data) => {
        this.allTransactions = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load transactions. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTransactions = this.allTransactions.filter(tx => {
      const typeMatch = this.selectedType === 'ALL' || tx.transactionType === this.selectedType;
      const statusMatch = this.selectedStatus === 'ALL' || tx.transactionStatus === this.selectedStatus;
      return typeMatch && statusMatch;
    });
  }

  onTypeChange(value: string): void {
    this.selectedType = value as TransactionType2 | 'ALL';
    this.applyFilters();
  }

  onStatusChange(value: string): void {
    this.selectedStatus = value as TransactionStatus | 'ALL';
    this.applyFilters();
  }

  get totalQuantity(): number {
    return this.filteredTransactions.reduce((sum, tx) => sum + (tx.quantity ?? 0), 0);
  }

  get totalAmount(): number {
    return this.filteredTransactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  }

  formatType(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}