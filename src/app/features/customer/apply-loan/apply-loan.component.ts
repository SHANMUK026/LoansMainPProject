import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LoanApplication } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-loan.component.html',
  styleUrls: ['./apply-loan.component.css']
})
export class ApplyLoanComponent implements OnInit {
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  loanForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loanForm = this.fb.group({
      requestedAmount: ['', [Validators.required, Validators.min(1000), Validators.max(1000000)]],
      purpose: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  onSubmit(): void {
    if (this.loanForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.mockApi.createLoanApplication(this.loanForm.value).subscribe({
        next: (application: LoanApplication) => {
          // Redirect to eligibility results
          this.router.navigate(['/eligibility', application.id]);
        },
        error: (error) => {
          this.errorMessage = 'Failed to submit application: ' + error.message;
          this.isSubmitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  get requestedAmount() {
    return this.loanForm.get('requestedAmount');
  }

  get purpose() {
    return this.loanForm.get('purpose');
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
