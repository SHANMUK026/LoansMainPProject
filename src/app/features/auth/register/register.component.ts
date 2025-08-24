import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  selectedUserType: 'BORROWER' | 'LENDER' = 'BORROWER';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      role: ['BORROWER', [Validators.required]],
      // Lender-specific fields
      companyName: [''],
      lendingLicense: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {

    // Set up conditional validators
    this.updateValidators();
  }

  get username() {
    return this.registerForm.get('username');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['mismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  selectUserType(type: 'BORROWER' | 'LENDER'): void {
    this.selectedUserType = type;
    this.updateValidators();
  }

  updateValidators(): void {
    const companyNameControl = this.registerForm.get('companyName');
    const lendingLicenseControl = this.registerForm.get('lendingLicense');

    if (this.selectedUserType === 'LENDER') {
      companyNameControl?.setValidators([Validators.required]);
      lendingLicenseControl?.setValidators([Validators.required]);
    } else {
      companyNameControl?.clearValidators();
      lendingLicenseControl?.clearValidators();
    }

    companyNameControl?.updateValueAndValidity();
    lendingLicenseControl?.updateValueAndValidity();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.selectedUserType) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValues = this.registerForm.value;
    const registerRequest = {
      id: 0, // Will be set by the service
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
      roles: [this.selectedUserType],
      role: this.selectedUserType,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      phone: formValues.phone,
      // Add lender-specific fields if applicable
      ...(this.selectedUserType === 'LENDER' && {
        company: formValues.companyName,
        lendingLicense: formValues.lendingLicense
      })
    };

    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Navigate based on role
        if (this.selectedUserType === 'LENDER') {
          this.router.navigate(['/lender/dashboard']);
        } else {
          this.router.navigate(['/borrower/dashboard']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
