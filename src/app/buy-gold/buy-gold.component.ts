import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoldTransactionService } from '../core/services/gold-transaction.service';
import { AuthService } from '../core/services/auth.services';
import { VendorBranch } from '../core/models/vendor-branch.model';
import { TransactionHistoryResponse, PaymentMethod } from '../core/models/transaction-history.model';

@Component({
  selector: 'app-buy-gold',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buy-gold.component.html',
  styleUrls: ['./buy-gold.component.css']
})
export class BuyGoldComponent implements OnInit {
  buyGoldForm!: FormGroup;
  branches: VendorBranch[] = [];
  lastTransaction: TransactionHistoryResponse | null = null;

  isLoadingBranches = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  paymentMethods: PaymentMethod[] = [
    'CREDIT_CARD',
    'DEBIT_CARD',
    'GOOGLE_PAY',
    'AMAZON_PAY',
    'PHONEPE',
    'PAYTM',
    'BANK_TRANSFER'
  ];

  constructor(
    private fb: FormBuilder,
    private goldService: GoldTransactionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBranches();
  }

  private buildForm(): void {
    this.buyGoldForm = this.fb.group({
      branchId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
      paymentMethod: [null, Validators.required]
    });
  }

  private loadBranches(): void {
    this.isLoadingBranches = true;
    this.goldService.getAllBranches().subscribe({
      next: (data) => {
        this.branches = data;
        this.isLoadingBranches = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load branches. Please try again.';
        this.isLoadingBranches = false;
      }
    });
  }

  get selectedBranch(): VendorBranch | null {
    const id = Number(this.buyGoldForm.get('branchId')?.value);
    return this.branches.find(b => b.branchId === id) ?? null;
  }

  get estimatedAmount(): number | null {
    const branch = this.selectedBranch;
    const qty = this.buyGoldForm.get('quantity')?.value;
    if (branch && qty && qty > 0) {
      return branch.vendor.currentGoldPrice * qty;
    }
    return null;
  }

  formatPaymentMethod(method: string): string {
    return method.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  onSubmit(): void {
    if (this.buyGoldForm.invalid) {
      this.buyGoldForm.markAllAsTouched();
      return;
    }

    const session = this.authService.getAuthenticatedUser();

    if (!session) {
    this.errorMessage = 'Session expired. Please log in again.';
    return;
    }

    const userId = session.userId;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      userId,
      branchId: Number(this.buyGoldForm.value.branchId),
      quantity: this.buyGoldForm.value.quantity,
      paymentMethod: this.buyGoldForm.value.paymentMethod
    };

    this.goldService.buyGold(payload).subscribe({
      next: (response) => {
        this.lastTransaction = response;
        this.successMessage = 'Gold purchased successfully!';
        this.isSubmitting = false;
        this.buyGoldForm.reset();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Purchase failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}