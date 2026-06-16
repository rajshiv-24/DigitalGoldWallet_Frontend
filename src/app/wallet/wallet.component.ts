import { Component, OnInit, OnDestroy }    from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { RouterLink }                      from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
}                                          from '@angular/forms';
import { Subject, takeUntil }             from 'rxjs';
import { AuthService }                    from '../core/services/auth.services';
import { WalletService }                  from '../core/services/wallet.service';
import { UserResponse }                   from '../core/models/dashboard.models';
import {
  PaymentMethod,
  PaymentResponse,
  WalletTopUpRequest
}                                         from '../core/models/wallet.models';

// ── Custom validator: amount must be > 0 ─────────────────────
function positiveAmountValidator(
  control: AbstractControl
): ValidationErrors | null {
  const val = parseFloat(control.value);
  if (isNaN(val) || val <= 0) {
    return { nonPositive: true };
  }
  return null;
}

@Component({
  selector:    'app-wallet',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './wallet.component.html',
  styleUrls:   ['./wallet.component.css']
})
export class WalletComponent implements OnInit, OnDestroy {

  // ── Form ──────────────────────────────────────────────────
  topUpForm: FormGroup;

  // ── UI state ──────────────────────────────────────────────
  isSubmitting   = false;
  isLoadingUser  = true;
  successMessage: string | null = null;
  errorMessage:   string | null = null;

  // ── Data ──────────────────────────────────────────────────
  userProfile:      UserResponse    | null = null;
  lastPayment:      PaymentResponse | null = null;
  private userId!:  number;

  // ── Payment method options — must match Java enum names ───
  readonly paymentMethods: { label: string; value: PaymentMethod }[] = [
  { label: 'Paytm',         value: 'PAYTM' },
  { label: 'Google Pay',    value: 'GOOGLE_PAY' },
  { label: 'PhonePe',       value: 'PHONEPE' },
  { label: 'Debit Card',    value: 'DEBIT_CARD' },
  { label: 'Credit Card',   value: 'CREDIT_CARD' },
  { label: 'Amazon Pay',    value: 'AMAZON_PAY' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' }
];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb:            FormBuilder,
    private readonly authService:   AuthService,
    private readonly walletService: WalletService
  ) {
    this.topUpForm = this.fb.group({
      amount: [
        '',
        [Validators.required, positiveAmountValidator]
      ],
      paymentMethod: [
        '',
        [Validators.required]
      ]
    });
  }

  ngOnInit(): void {
    const session = this.authService.getAuthenticatedUser();

    if (!session) {
      // Guard handles the redirect; this is a safety fallback.
      return;
    }

    this.userId = session.userId;
    this.loadUserProfile();
  }

  // ── Field accessors ───────────────────────────────────────
  get amount()        { return this.topUpForm.get('amount')!; }
  get paymentMethod() { return this.topUpForm.get('paymentMethod')!; }

  get isAmountInvalid(): boolean {
    return this.amount.invalid && (this.amount.dirty || this.amount.touched);
  }

  get isPaymentMethodInvalid(): boolean {
    return this.paymentMethod.invalid &&
           (this.paymentMethod.dirty || this.paymentMethod.touched);
  }

  // ── Load current balance ──────────────────────────────────
  private loadUserProfile(): void {
    this.isLoadingUser = true;

    this.walletService.getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.userProfile  = user;
          this.isLoadingUser = false;
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            err?.message ||
            'Failed to load wallet balance.';
          this.isLoadingUser = false;
        }
      });
  }

  // ── Submit top-up ─────────────────────────────────────────
  onSubmit(): void {
    if (this.topUpForm.invalid) {
      this.topUpForm.markAllAsTouched();
      return;
    }

    this.isSubmitting  = true;
    this.successMessage = null;
    this.errorMessage   = null;
    this.lastPayment    = null;

    // userId is taken from AuthService — never from the form
    const payload: WalletTopUpRequest = {
      userId:        this.userId,
      amount:        parseFloat(this.amount.value),
      paymentMethod: this.paymentMethod.value as PaymentMethod
    };

    this.walletService.topUpWallet(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaymentResponse) => {
          this.lastPayment    = response;
          this.successMessage =
            `₹${response.amount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} added to your wallet successfully via ${this.formatMethod(response.paymentMethod)}.`;
          this.isSubmitting = false;
          this.topUpForm.reset();
          // Refresh balance card with live data from backend
          this.refreshBalance();
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            err?.message ||
            'Top-up failed. Please try again.';
          this.isSubmitting = false;
        }
      });
  }

  // ── Refresh balance after successful top-up ───────────────
  private refreshBalance(): void {
    this.walletService.getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => { this.userProfile = user; },
        error: () => {
          // Balance refresh failure is non-critical;
          // the top-up itself already succeeded.
        }
      });
  }

  // ── Helpers ───────────────────────────────────────────────
  formatMethod(method: PaymentMethod): string {
    const found = this.paymentMethods.find(m => m.value === method);
    return found ? found.label : method;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return 'badge-success';
      case 'PENDING': return 'badge-pending';
      case 'FAILED':  return 'badge-failed';
      default:        return 'badge-pending';
    }
  }

  dismissSuccess(): void { this.successMessage = null; this.lastPayment = null; }
  dismissError():   void { this.errorMessage   = null; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}