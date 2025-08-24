import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-borrower-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrower-dashboard.component.html',
  styleUrl: './borrower-dashboard.component.css'
})
export class BorrowerDashboardComponent implements OnInit {
  currentUser: User | null = null;
  loanApplications: any[] = [];
  eligibleLenders: any[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.hasRole('BORROWER')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    // TODO: Load real data from backend
    setTimeout(() => {
      this.loanApplications = [
        {
          id: 1,
          amount: 50000,
          purpose: 'Home Renovation',
          status: 'PENDING',
          appliedDate: new Date('2024-01-15'),
          lenderName: 'City Bank'
        },
        {
          id: 2,
          amount: 25000,
          purpose: 'Education',
          status: 'APPROVED',
          appliedDate: new Date('2024-01-10'),
          lenderName: 'State Bank'
        }
      ];

      this.eligibleLenders = [
        {
          id: 1,
          name: 'City Bank',
          minSalary: 300000,
          maxLoanAmount: 1000000,
          interestRate: '12%',
          processingFee: '2%'
        },
        {
          id: 2,
          name: 'State Bank',
          minSalary: 250000,
          maxLoanAmount: 500000,
          interestRate: '14%',
          processingFee: '1.5%'
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  applyForLoan() {
    this.router.navigate(['/borrower/apply-loan']);
  }

  viewApplication(applicationId: number) {
    this.router.navigate(['/borrower/application', applicationId]);
  }

  checkEligibility() {
    this.router.navigate(['/borrower/eligibility-check']);
  }

  openLoanCalculator() {
    this.router.navigate(['/borrower/loan-calculator']);
  }

  openSmartMatching() {
    this.router.navigate(['/borrower/smart-matching']);
  }

  openDocumentManagement() {
    this.router.navigate(['/borrower/documents']);
  }

  viewProfile() {
    this.router.navigate(['/borrower/profile']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'PENDING': return 'status-pending';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'PENDING': return '⏳';
      default: return '❓';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
