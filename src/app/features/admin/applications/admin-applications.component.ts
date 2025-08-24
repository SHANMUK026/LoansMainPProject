import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LoanApplication } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-applications.component.html',
  styleUrls: ['./admin-applications.component.css']
})
export class AdminApplicationsComponent implements OnInit {
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
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.mockApi.getLoanApplications().subscribe({
      next: (applications: LoanApplication[]) => {
        this.applications = applications;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load applications: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'badge--success';
      case 'REJECTED':
        return 'badge--danger';
      case 'PENDING':
        return 'badge--warning';
      case 'UNDER_REVIEW':
        return 'badge--info';
      default:
        return 'badge--warning';
    }
  }

  getEligibilityClass(score: number | undefined): string {
    if (!score) return 'eligibility--unknown';
    if (score >= 80) return 'eligibility--high';
    if (score >= 60) return 'eligibility--medium';
    return 'eligibility--low';
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  }

  viewApplicationDetails(application: LoanApplication): void {
    this.selectedApplication = application;
    this.showApplicationDetails = true;
  }

  closeApplicationDetails(): void {
    this.selectedApplication = null;
    this.showApplicationDetails = false;
  }

  getApplicationStats(): { total: number; approved: number; rejected: number; pending: number } {
    const total = this.applications.length;
    const approved = this.applications.filter(app => app.status === 'APPROVED').length;
    const rejected = this.applications.filter(app => app.status === 'REJECTED').length;
    const pending = this.applications.filter(app => app.status === 'PENDING').length;

    return { total, approved, rejected, pending };
  }

  getTotalLoanVolume(): string {
    const total = this.applications
      .filter(app => app.status === 'APPROVED')
      .reduce((sum, app) => sum + (app.loanAmount || 0), 0);
    
    return this.formatCurrency(total);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
