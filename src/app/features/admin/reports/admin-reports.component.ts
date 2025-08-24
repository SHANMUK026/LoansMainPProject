import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reports.component.html',
  styleUrls: ['./admin-reports.component.css']
})
export class AdminReportsComponent implements OnInit {
  currentUser: any = null;
  availableReports = [
    {
      id: 'monthly-summary',
      name: 'Monthly Summary Report',
      description: 'Overview of platform activity for the current month',
      icon: '📊',
      category: 'Summary'
    },
    {
      id: 'user-activity',
      name: 'User Activity Report',
      description: 'Detailed user engagement and activity metrics',
      icon: '👥',
      category: 'Users'
    },
    {
      id: 'loan-performance',
      name: 'Loan Performance Report',
      description: 'Analysis of loan applications and approval rates',
      icon: '💰',
      category: 'Loans'
    },
    {
      id: 'lender-analysis',
      name: 'Lender Analysis Report',
      description: 'Performance metrics for all registered lenders',
      icon: '🏦',
      category: 'Lenders'
    },
    {
      id: 'risk-assessment',
      name: 'Risk Assessment Report',
      description: 'Platform risk metrics and compliance data',
      icon: '⚠️',
      category: 'Risk'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Revenue, costs, and financial performance metrics',
      icon: '💳',
      category: 'Finance'
    }
  ];

  selectedReport: string = '';
  reportDateRange = 'current-month';
  isGenerating = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
  }

  selectReport(reportId: string): void {
    this.selectedReport = reportId;
  }

  generateReport(): void {
    if (!this.selectedReport) return;
    
    this.isGenerating = true;
    
    // Simulate report generation
    setTimeout(() => {
      this.isGenerating = false;
      console.log(`Generating ${this.selectedReport} report for ${this.reportDateRange}`);
      // In real app, this would call an API and download the report
    }, 2000);
  }

  downloadReport(reportId: string): void {
    console.log(`Downloading ${reportId} report`);
    // In real app, this would trigger a file download
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
