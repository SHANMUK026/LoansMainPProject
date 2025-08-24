import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { EligibilityResult } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-eligibility-check',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eligibility-check.component.html',
  styleUrls: ['./eligibility-check.component.css']
})
export class EligibilityCheckComponent implements OnInit {
  applicationId = 1; // Default to first application for demo
  eligibilityResults: EligibilityResult[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkEligibility();
  }

  checkEligibility(): void {
    this.isLoading = true;
    this.mockApi.checkEligibility(this.applicationId).subscribe({
      next: (results) => {
        this.eligibilityResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to check eligibility: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  getEligibleCount(): number {
    return this.eligibilityResults.filter(result => result.eligible).length;
  }

  getTotalCount(): number {
    return this.eligibilityResults.length;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    // Note: This component doesn't have AuthService injected
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
