import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoldTransactionService } from '../core/services/gold-transaction.service';
import { AddressService } from '../core/services/address.service';
import { AuthService } from '../core/services/auth.services';

import { VendorBranch } from '../core/models/vendor-branch.model';
import { Address } from '../core/models/address.model';
import {
  ConvertToPhysicalRequest,
  PhysicalGoldTransactionResponse
} from '../core/models/physical-gold.model';

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-physical-gold',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './physical-gold.component.html',
  styleUrls: ['./physical-gold.component.css']
})
export class PhysicalGoldComponent implements OnInit {

  convertForm!: FormGroup;

  branches: VendorBranch[] = [];
  addresses: Address[] = [];

  isLoadingBranches = false;
  isLoadingAddresses = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  lastTransaction: PhysicalGoldTransactionResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private goldService: GoldTransactionService,
    private addressService: AddressService,
    private authService: AuthService,
    private router: Router
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
    this.loadBranches();
    this.loadAddresses();
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.convertForm = this.fb.group({
      branchId:          [null, Validators.required],
      quantity:          [null, [Validators.required, Validators.min(0.01)]],
      deliveryAddressId: [null, Validators.required]
    });
  }

  // ── Data loading ───────────────────────────────────────────────────────────

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

  private loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.addressService.getAllAddresses().subscribe({
      next: (data) => {
  this.addresses = [...data].sort(
    (a, b) => a.addressId - b.addressId
  );

  this.isLoadingAddresses = false;
},
      error: () => {
        this.errorMessage = 'Failed to load addresses. Please try again.';
        this.isLoadingAddresses = false;
      }
    });
  }

  // ── Derived getters ────────────────────────────────────────────────────────

  get selectedBranch(): VendorBranch | null {
    const id = Number(this.convertForm.get('branchId')?.value);
    return this.branches.find(b => b.branchId === id) ?? null;
  }

  get selectedAddress(): Address | null {
    const id = Number(this.convertForm.get('deliveryAddressId')?.value);
    return this.addresses.find(a => a.addressId === id) ?? null;
  }

  get isLoadingDropdowns(): boolean {
    return this.isLoadingBranches || this.isLoadingAddresses;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.convertForm.invalid) {
      this.convertForm.markAllAsTouched();
      return;
    }

    const session = this.authService.getAuthenticatedUser();
    const userId = session?.userId;

    if (!userId) {
      this.errorMessage = 'Session expired. Please log in again.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: ConvertToPhysicalRequest = {
      userId,
      branchId:          Number(this.convertForm.value.branchId),
      quantity:          this.convertForm.value.quantity,
      deliveryAddressId: Number(this.convertForm.value.deliveryAddressId)
    };

    this.goldService.convertToPhysical(payload).subscribe({
      next: (response: PhysicalGoldTransactionResponse) => {
        this.lastTransaction = response;
        this.successMessage = 'Gold conversion to physical initiated successfully!';
        this.isSubmitting = false;
        this.convertForm.reset();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Conversion failed. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}