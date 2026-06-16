import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.services';
import { RegisterRequest } from '../../core/models/auth.models';

// ── Cross-field validator: password === confirmPassword ───
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password        = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnDestroy {

  registerForm: FormGroup;
  isLoading       = false;
  errorMessage: string | null = null;
  showPassword        = false;
  showConfirmPassword = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb:          FormBuilder,
    private readonly authService: AuthService,
    private readonly router:      Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: [
          '',
          [Validators.required, Validators.minLength(2), Validators.maxLength(80)]
        ],
        email: [
          '',
          [Validators.required, Validators.email]
        ],
        password: [
          '',
          [Validators.required, Validators.minLength(8)]
        ],
        confirmPassword: [
          '',
          [Validators.required]
        ]
      },
      { validators: passwordMatchValidator }
    );
  }

  // ── Field accessors ───────────────────────────────────────
  get name()            { return this.registerForm.get('name')!; }
  get email()           { return this.registerForm.get('email')!; }
  get password()        { return this.registerForm.get('password')!; }
  get confirmPassword() { return this.registerForm.get('confirmPassword')!; }

  // ── Dirty-or-touched invalid helpers ─────────────────────
  get isNameInvalid(): boolean {
    return this.name.invalid && (this.name.dirty || this.name.touched);
  }

  get isEmailInvalid(): boolean {
    return this.email.invalid && (this.email.dirty || this.email.touched);
  }

  get isPasswordInvalid(): boolean {
    return this.password.invalid && (this.password.dirty || this.password.touched);
  }

  get isConfirmPasswordInvalid(): boolean {
    const touched = this.confirmPassword.dirty || this.confirmPassword.touched;
    const mismatch = this.registerForm.errors?.['passwordMismatch'] && touched;
    return (this.confirmPassword.invalid && touched) || !!mismatch;
  }

  // ── Password strength ─────────────────────────────────────
  get passwordStrength(): 'weak' | 'fair' | 'strong' | null {
    const val = this.password.value as string;
    if (!val) return null;
    const hasUpper   = /[A-Z]/.test(val);
    const hasLower   = /[a-z]/.test(val);
    const hasDigit   = /\d/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);
    const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
    if (val.length < 8)    return 'weak';
    if (score <= 2)        return 'fair';
    return 'strong';
  }

  get passwordStrengthWidth(): string {
    const map = { weak: '33%', fair: '66%', strong: '100%' };
    return this.passwordStrength ? map[this.passwordStrength] : '0%';
  }

  get passwordStrengthClass(): string {
    const map = { weak: 'strength-weak', fair: 'strength-fair', strong: 'strength-strong' };
    return this.passwordStrength ? map[this.passwordStrength] : '';
  }

  get passwordStrengthLabel(): string {
    const map = { weak: 'Weak', fair: 'Fair', strong: 'Strong' };
    return this.passwordStrength ? map[this.passwordStrength] : '';
  }

  // ── Toggle visibility ─────────────────────────────────────
  togglePassword(): void        { this.showPassword        = !this.showPassword; }
  toggleConfirmPassword(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  // ── Submit ────────────────────────────────────────────────
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = null;

    const payload: RegisterRequest = {
      name:     this.name.value.trim(),
      email:    this.email.value.trim(),
      password: this.password.value
    };

    this.authService.register(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading    = false;
          this.errorMessage =
            err?.error?.message ||
            err?.message ||
            'Registration failed. Please try again.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}