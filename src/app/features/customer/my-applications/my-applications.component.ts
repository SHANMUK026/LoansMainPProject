import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LoanApplication } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  applications: LoanApplication[] = [];
  isLoading = false;
  errorMessage = '';

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

    this.mockApi.getCustomerApplications().subscribe({
      next: (apps: LoanApplication[]) => {
        this.applications = apps;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load applications: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  viewEligibility(applicationId: number): void {
    this.router.navigate(['/eligibility', applicationId]);
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
