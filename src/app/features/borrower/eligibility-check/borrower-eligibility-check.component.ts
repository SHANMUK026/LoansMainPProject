import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-borrower-eligibility-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrower-eligibility-check.component.html',
  styleUrl: './borrower-eligibility-check.component.css'
})
export class BorrowerEligibilityCheckComponent implements OnInit {
  currentUser: User | null = null;
  eligibilityResults: any[] = [];
  isLoading = false;
  errorMessage = '';
  showDetailedResults = false;

  constructor(
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {}

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

    this.checkEligibility();
  }

  checkEligibility(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulate eligibility check based on user profile
    setTimeout(() => {
      this.eligibilityResults = [
        {
          lenderId: 1,
          lenderName: 'City Bank',
          eligible: true,
          maxLoanAmount: 1000000,
          interestRate: '12%',
          processingFee: '2%',
          eligibilityScore: 85,
          requirements: ['Credit Score: 650+', 'Income: ₹25,000+', 'Age: 18-65'],
          reasons: ['Excellent credit score', 'Stable income', 'Good employment history'],
          riskLevel: 'LOW',
          approvalTime: '2-3 business days'
        },
        {
          lenderId: 2,
          lenderName: 'State Bank',
          eligible: true,
          maxLoanAmount: 500000,
          interestRate: '14%',
          processingFee: '1.5%',
          eligibilityScore: 78,
          requirements: ['Credit Score: 600+', 'Income: ₹20,000+', 'Age: 21-60'],
          reasons: ['Good credit score', 'Adequate income', 'Regular employment'],
          riskLevel: 'MEDIUM',
          approvalTime: '3-5 business days'
        },
        {
          lenderId: 3,
          lenderName: 'National Bank',
          eligible: false,
          maxLoanAmount: 750000,
          interestRate: '13%',
          processingFee: '2.5%',
          eligibilityScore: 45,
          requirements: ['Credit Score: 700+', 'Income: ₹50,000+', 'Age: 25-55'],
          reasons: ['Credit score below requirement', 'Income below threshold'],
          riskLevel: 'HIGH',
          approvalTime: '5-7 business days'
        },
        {
          lenderId: 4,
          lenderName: 'Metro Bank',
          eligible: true,
          maxLoanAmount: 300000,
          interestRate: '15%',
          processingFee: '3%',
          eligibilityScore: 72,
          requirements: ['Credit Score: 550+', 'Income: ₹15,000+', 'Age: 18-70'],
          reasons: ['Acceptable credit score', 'Minimum income met', 'Flexible age range'],
          riskLevel: 'MEDIUM',
          approvalTime: '4-6 business days'
        }
      ];
      this.isLoading = false;
    }, 2000);
  }

  getEligibleCount(): number {
    return this.eligibilityResults.filter(result => result.eligible).length;
  }

  getTotalCount(): number {
    return this.eligibilityResults.length;
  }

  getEligibilityClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getRiskClass(riskLevel: string): string {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'low-risk';
      case 'medium': return 'medium-risk';
      case 'high': return 'high-risk';
      default: return 'unknown-risk';
    }
  }

  getRiskIcon(riskLevel: string): string {
    switch (riskLevel.toLowerCase()) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '⚪';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  applyToLender(lenderId: number): void {
    this.router.navigate(['/borrower/apply-loan'], {
      queryParams: { lender: lenderId }
    });
  }

  viewDetailedResults(): void {
    this.showDetailedResults = !this.showDetailedResults;
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getOverallEligibilityScore(): number {
    if (this.eligibilityResults.length === 0) return 0;
    const totalScore = this.eligibilityResults.reduce((sum, result) => sum + result.eligibilityScore, 0);
    return Math.round(totalScore / this.eligibilityResults.length);
  }

  getOverallEligibilityClass(): string {
    const score = this.getOverallEligibilityScore();
    return this.getEligibilityClass(score);
  }

  getOverallEligibilityMessage(): string {
    const score = this.getOverallEligibilityScore();
    if (score >= 80) return 'Excellent! You have very high chances of approval with most lenders.';
    if (score >= 60) return 'Good! You have high chances of approval with several lenders.';
    if (score >= 40) return 'Fair. Consider improving your profile for better chances.';
    return 'Poor. We recommend improving your financial profile before applying.';
  }
}
