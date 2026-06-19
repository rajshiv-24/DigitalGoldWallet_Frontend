import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoldTransactionService } from '../core/services/gold-transaction.service';
import { AuthService } from '../core/services/auth.services';
import { VendorBranch } from '../core/models/vendor-branch.model';
import { TransactionHistoryResponse , SellGoldRequest} from '../core/models/transaction-history.model';


@Component({
  selector: 'app-sell-gold',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell-gold.component.html',
  styleUrls: ['./sell-gold.component.css']
})
export class SellGoldComponent implements OnInit {
  sellGoldForm!: FormGroup;
  branches: VendorBranch[] = [];
  lastTransaction: TransactionHistoryResponse | null = null;

  isLoadingBranches = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

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
    this.sellGoldForm = this.fb.group({
      branchId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  private loadBranches(): void {
  this.isLoadingBranches = true;

  this.goldService.getAllBranches().subscribe({
    next: (data) => {
      this.branches = [...data].sort(
        (a, b) => a.branchId - b.branchId
      );

      this.isLoadingBranches = false;
    },
    error: () => {
      this.errorMessage = 'Failed to load branches. Please try again.';
      this.isLoadingBranches = false;
    }
  });
}

  get selectedBranch(): VendorBranch | null {
    const id = Number(this.sellGoldForm.get('branchId')?.value);
    return this.branches.find(b => b.branchId === id) ?? null;
  }

  get estimatedReturn(): number | null {
    const branch = this.selectedBranch;
    const qty = this.sellGoldForm.get('quantity')?.value;
    if (branch && qty && qty > 0) {
      return branch.vendor.currentGoldPrice * qty;
    }
    return null;
  }

  onSubmit(): void {
    if (this.sellGoldForm.invalid) {
      this.sellGoldForm.markAllAsTouched();
      return;
    }

    const session = this.authService.getAuthenticatedUser();

    if (!session) {
    this.errorMessage = 'Session expired. Please log in again.';
    return;
    }

    const userId = session.userId;

    this.isSubmitting = true;

    console.log('Form Value:', this.sellGoldForm.value);
    console.log('Selected Branch:', this.selectedBranch);

    this.errorMessage = '';
    this.successMessage = '';

    const payload: SellGoldRequest = {
      userId,
      branchId: Number(this.sellGoldForm.value.branchId),
      quantity: this.sellGoldForm.value.quantity
    };

    console.log('Payload:', payload);

    this.goldService.sellGold(payload).subscribe({
      next: (response) => {
        this.lastTransaction = response;
        this.successMessage = 'Gold sold successfully!';
        this.isSubmitting = false;
        this.sellGoldForm.reset();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Sale failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}