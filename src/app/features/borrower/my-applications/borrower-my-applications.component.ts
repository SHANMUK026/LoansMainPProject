import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LoanApplication, User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-borrower-my-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrower-my-applications.component.html',
  styleUrl: './borrower-my-applications.component.css'
})
export class BorrowerMyApplicationsComponent implements OnInit {
  currentUser: User | null = null;
  applications: LoanApplication[] = [];
  isLoading = false;
  errorMessage = '';
  selectedApplication: LoanApplication | null = null;
  showApplicationDetails = false;

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

    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulate loading applications for the current borrower
    setTimeout(() => {
      this.applications = [
        {
          id: 1,
          customerId: this.currentUser?.id || 1,
          borrowerId: this.currentUser?.id || 1,
          lenderId: 1,
          requestedAmount: 50000,
          loanAmount: 50000,
          loanPurpose: 'Home Renovation',
          loanTerm: 5,
          status: 'PENDING',
          createdAt: '2024-01-15T00:00:00Z',
          appliedDate: new Date('2024-01-15'),
          updatedAt: '2024-01-15',
          eligibilityScore: 75,
          monthlyIncome: this.currentUser?.monthlyIncome || 50000,
          creditScore: this.currentUser?.creditScore || 700,
          employmentStatus: this.currentUser?.employmentStatus || 'EMPLOYED',
          monthlyEMI: 1200,
          comments: 'Application under review',
          decisionDate: undefined,
          decisionBy: undefined
        },
        {
          id: 2,
          customerId: this.currentUser?.id || 1,
          borrowerId: this.currentUser?.id || 1,
          lenderId: 2,
          requestedAmount: 25000,
          loanAmount: 25000,
          loanPurpose: 'Education',
          loanTerm: 3,
          status: 'APPROVED',
          createdAt: '2024-01-10T00:00:00Z',
          appliedDate: new Date('2024-01-10'),
          updatedAt: '2024-01-12',
          eligibilityScore: 85,
          monthlyIncome: this.currentUser?.monthlyIncome || 50000,
          creditScore: this.currentUser?.creditScore || 700,
          employmentStatus: this.currentUser?.employmentStatus || 'EMPLOYED',
          monthlyEMI: 800,
          comments: 'Application approved with standard terms',
          decisionDate: '2024-01-12',
          decisionBy: 'Lender Manager'
        },
        {
          id: 3,
          customerId: this.currentUser?.id || 1,
          borrowerId: this.currentUser?.id || 1,
          lenderId: 3,
          requestedAmount: 100000,
          loanAmount: 100000,
          loanPurpose: 'Business Expansion',
          loanTerm: 7,
          status: 'REJECTED',
          createdAt: '2024-01-05T00:00:00Z',
          appliedDate: new Date('2024-01-05'),
          updatedAt: '2024-01-08',
          eligibilityScore: 45,
          monthlyIncome: this.currentUser?.monthlyIncome || 50000,
          creditScore: this.currentUser?.creditScore || 700,
          employmentStatus: this.currentUser?.employmentStatus || 'EMPLOYED',
          monthlyEMI: 0,
          comments: 'Insufficient income for requested amount',
          decisionDate: '2024-01-08',
          decisionBy: 'Risk Analyst'
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  viewApplicationDetails(application: LoanApplication): void {
    this.selectedApplication = application;
    this.showApplicationDetails = true;
  }

  closeApplicationDetails(): void {
    this.showApplicationDetails = false;
    this.selectedApplication = null;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'badge--success';
      case 'REJECTED':
        return 'badge--error';
      case 'CANCELLED':
        return 'badge--warning';
      default:
        return 'badge--pending';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'CANCELLED':
        return '⚠️';
      default:
        return '⏳';
    }
  }

  getEligibilityClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatUpdatedDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return this.formatDate(new Date(dateString));
  }

  formatDecisionDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return this.formatDate(new Date(dateString));
  }

  getLenderName(lenderId: number): string {
    const lenders = [
      { id: 1, name: 'City Bank' },
      { id: 2, name: 'State Bank' },
      { id: 3, name: 'National Bank' }
    ];
    return lenders.find(l => l.id === lenderId)?.name || 'Unknown Lender';
  }

  applyForNewLoan(): void {
    this.router.navigate(['/borrower/apply-loan']);
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getApplicationStats() {
    const total = this.applications.length;
    const approved = this.applications.filter(app => app.status === 'APPROVED').length;
    const pending = this.applications.filter(app => app.status === 'PENDING').length;
    const rejected = this.applications.filter(app => app.status === 'REJECTED').length;
    
    return { total, approved, pending, rejected };
  }

  getTotalApprovedAmount(): number {
    return this.applications
      .filter(app => app.status === 'APPROVED')
      .reduce((sum, app) => sum + app.loanAmount, 0);
  }

  getAverageEligibilityScore(): number {
    const scores = this.applications.map(app => app.eligibilityScore || 0);
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  }
}
