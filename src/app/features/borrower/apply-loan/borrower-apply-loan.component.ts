import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LoanApplication, User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-borrower-apply-loan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './borrower-apply-loan.component.html',
  styleUrl: './borrower-apply-loan.component.css'
})
export class BorrowerApplyLoanComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showEligibilityCheck = false;
  eligibilityScore = 0;

  loanForm: FormGroup;
  availableLenders: any[] = [];

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {
    this.loanForm = this.fb.group({
      requestedAmount: ['', [Validators.required, Validators.min(1000), Validators.max(1000000)]],
      purpose: ['', [Validators.required, Validators.minLength(10)]],
      loanTerm: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      preferredLender: [''],
      collateralType: [''],
      collateralValue: [''],
      additionalDocuments: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.hasRole('BORROWER')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAvailableLenders();
    this.calculateEligibilityScore();
  }

  loadAvailableLenders() {
    this.isLoading = true;
    // Simulate loading available lenders
    setTimeout(() => {
      this.availableLenders = [
        { id: 1, name: 'City Bank', interestRate: '12%', processingFee: '2%', maxAmount: 1000000 },
        { id: 2, name: 'State Bank', interestRate: '14%', processingFee: '1.5%', maxAmount: 500000 },
        { id: 3, name: 'National Bank', interestRate: '13%', processingFee: '2.5%', maxAmount: 750000 }
      ];
      this.isLoading = false;
    }, 1000);
  }

  calculateEligibilityScore() {
    if (!this.currentUser) return;
    
    let score = 0;
    
    // Credit score contribution (40%)
    if (this.currentUser?.creditScore) {
      if (this.currentUser.creditScore >= 750) score += 40;
      else if (this.currentUser.creditScore >= 650) score += 30;
      else if (this.currentUser.creditScore >= 550) score += 20;
      else score += 10;
    }
    
    // Income contribution (30%)
    if (this.currentUser?.monthlyIncome) {
      if (this.currentUser.monthlyIncome >= 100000) score += 30;
      else if (this.currentUser.monthlyIncome >= 50000) score += 25;
      else if (this.currentUser.monthlyIncome >= 25000) score += 20;
      else score += 15;
    }
    
    // Employment contribution (20%)
    if (this.currentUser?.employmentStatus) {
      switch (this.currentUser.employmentStatus) {
        case 'EMPLOYED': score += 20; break;
        case 'SELF_EMPLOYED': score += 18; break;
        case 'STUDENT': score += 15; break;
        default: score += 10; break;
      }
    }
    
    // Age contribution (10%)
    if (this.currentUser?.dateOfBirth) {
      const age = this.calculateAge(this.currentUser.dateOfBirth);
      if (age >= 25 && age <= 55) score += 10;
      else if (age >= 18 && age <= 65) score += 8;
      else score += 5;
    }
    
    this.eligibilityScore = Math.min(100, score);
  }

  calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  checkEligibility(): void {
    this.showEligibilityCheck = true;
    this.calculateEligibilityScore();
  }

  onSubmit(): void {
    if (this.loanForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const applicationData = {
        ...this.loanForm.value,
        borrowerId: this.currentUser?.id,
        appliedDate: new Date(),
        status: 'PENDING',
        eligibilityScore: this.eligibilityScore
      };

      this.mockApi.createLoanApplication(applicationData).subscribe({
        next: (application: LoanApplication) => {
          this.successMessage = 'Loan application submitted successfully!';
          this.isSubmitting = false;
          
          // Redirect after a delay
          setTimeout(() => {
            this.router.navigate(['/borrower/dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to submit application: ' + error.message;
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.loanForm.controls).forEach(key => {
      const control = this.loanForm.get(key);
      control?.markAsTouched();
    });
  }

  cancel(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get requestedAmount() {
    return this.loanForm.get('requestedAmount');
  }

  get purpose() {
    return this.loanForm.get('purpose');
  }

  get loanTerm() {
    return this.loanForm.get('loanTerm');
  }

  getEligibilityClass(): string {
    if (this.eligibilityScore >= 80) return 'excellent';
    if (this.eligibilityScore >= 60) return 'good';
    if (this.eligibilityScore >= 40) return 'fair';
    return 'poor';
  }

  getEligibilityMessage(): string {
    if (this.eligibilityScore >= 80) return 'Excellent! You have a very high chance of approval.';
    if (this.eligibilityScore >= 60) return 'Good! You have a high chance of approval.';
    if (this.eligibilityScore >= 40) return 'Fair. Consider improving your profile for better chances.';
    return 'Poor. We recommend improving your financial profile before applying.';
  }
}
