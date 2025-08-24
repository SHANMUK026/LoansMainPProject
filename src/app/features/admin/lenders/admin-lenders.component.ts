import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-lenders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-lenders.component.html',
  styleUrls: ['./admin-lenders.component.css']
})
export class AdminLendersComponent implements OnInit {
  lenders: User[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadLenders();
  }

  loadLenders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.mockApi.getUsers().subscribe({
      next: (users: User[]) => {
        this.lenders = users.filter(user => user.role === 'LENDER');
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load lenders: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  getLenderStatus(lender: User): string {
    // Mock status based on user data
    return 'Active'; // Default to active for demo
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'badge--success';
      case 'Inactive':
        return 'badge--danger';
      default:
        return 'badge--warning';
    }
  }

  approveLender(lender: User): void {
    // Mock approval functionality
    console.log('Approving lender:', lender.username);
    // In real app, this would call an API
  }

  rejectLender(lender: User): void {
    if (confirm(`Reject lender "${lender.username}"? This will prevent them from accessing the platform.`)) {
      // Mock rejection functionality
      console.log('Rejecting lender:', lender.username);
      // In real app, this would call an API
    }
  }

  suspendLender(lender: User): void {
    if (confirm(`Suspend lender "${lender.username}"? This will temporarily disable their account.`)) {
      // Mock suspension functionality
      console.log('Suspending lender:', lender.username);
      // In real app, this would call an API
    }
  }

  activateLender(lender: User): void {
    // Mock activation functionality
    console.log('Activating lender:', lender.username);
    // In real app, this would call an API
  }

  deleteLender(lender: User): void {
    if (confirm(`Are you sure you want to permanently delete lender "${lender.username}"? This action cannot be undone.`)) {
      // Mock deletion functionality
      console.log('Deleting lender:', lender.username);
      // In real app, this would call an API
      // Remove from local array for demo
      this.lenders = this.lenders.filter(l => l.id !== lender.id);
    }
  }

  verifyDocuments(lender: User): void {
    if (confirm(`Mark documents as verified for lender "${lender.username}"?`)) {
      // Mock document verification functionality
      console.log('Verifying documents for lender:', lender.username);
      // In real app, this would call an API
    }
  }

  viewLenderDetails(lender: User): void {
    // Mock view details functionality
    console.log('Viewing lender details:', lender.username);
    // In real app, this would navigate to a details page
  }

  viewLenderPerformance(lender: User): void {
    // Mock performance view functionality
    console.log('Viewing performance for lender:', lender.username);
    // In real app, this would navigate to performance page
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
