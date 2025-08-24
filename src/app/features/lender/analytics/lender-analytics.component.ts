import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LenderRule, LoanApplication, User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-lender-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lender-analytics.component.html',
  styleUrls: ['./lender-analytics.component.css']
})
export class LenderAnalyticsComponent implements OnInit {
  currentUser: User | null = null;
  eligibilityRules: LenderRule[] = [];
  loanApplications: LoanApplication[] = [];
  isLoading = false;
  
  // Analytics data
  totalApplications = 0;
  pendingApplications = 0;
  approvedApplications = 0;
  rejectedApplications = 0;
  totalLoanAmount = 0;
  averageLoanAmount = 0;
  approvalRate = 0;
  averageProcessingTime = 0;
  
  // Chart data
  monthlyApplications: any[] = [];
  loanAmountDistribution: any[] = [];
  creditScoreDistribution: any[] = [];
  employmentTypeStats: any[] = [];

  constructor(
    private authService: AuthService,
    private mockApi: MockApiService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser || this.currentUser.role !== 'LENDER') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadAnalyticsData();
  }

  loadAnalyticsData(): void {
    this.isLoading = true;
    
    // Load data
    this.mockApi.getLenderRules().subscribe({
      next: (rules: LenderRule[]) => {
        this.eligibilityRules = rules;
      },
      error: (error: any) => {
        console.error('Error loading rules:', error);
      }
    });

    this.mockApi.getLoanApplicationsByLender(this.currentUser!.id!).subscribe({
      next: (applications: any[]) => {
        this.loanApplications = applications;
        this.calculateAnalytics();
        this.generateChartData();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading applications:', error);
        this.isLoading = false;
      }
    });
  }

  calculateAnalytics(): void {
    this.totalApplications = this.loanApplications.length;
    this.pendingApplications = this.loanApplications.filter(app => app.status === 'PENDING').length;
    this.approvedApplications = this.loanApplications.filter(app => app.status === 'APPROVED').length;
    this.rejectedApplications = this.loanApplications.filter(app => app.status === 'REJECTED').length;
    
    // Calculate loan amounts
    const amounts = this.loanApplications.map(app => app.loanAmount || app.requestedAmount || 0);
    this.totalLoanAmount = amounts.reduce((sum, amount) => sum + amount, 0);
    this.averageLoanAmount = this.totalLoanAmount / this.totalApplications || 0;
    
    // Calculate approval rate
    this.approvalRate = this.totalApplications > 0 ? (this.approvedApplications / this.totalApplications) * 100 : 0;
    
    // Mock processing time
    this.averageProcessingTime = 2.5; // days
  }

  generateChartData(): void {
    // Monthly applications (mock data)
    this.monthlyApplications = [
      { month: 'Jan', applications: 12, approved: 8, rejected: 2, pending: 2 },
      { month: 'Feb', applications: 15, approved: 10, rejected: 3, pending: 2 },
      { month: 'Mar', applications: 18, approved: 12, rejected: 4, pending: 2 },
      { month: 'Apr', applications: 22, approved: 15, rejected: 5, pending: 2 },
      { month: 'May', applications: 25, approved: 18, rejected: 5, pending: 2 },
      { month: 'Jun', applications: 28, approved: 20, rejected: 6, pending: 2 }
    ];

    // Loan amount distribution
    this.loanAmountDistribution = [
      { range: '₹10K-50K', count: 15, percentage: 30 },
      { range: '₹50K-100K', count: 20, percentage: 40 },
      { range: '₹100K-200K', count: 10, percentage: 20 },
      { range: '₹200K+', count: 5, percentage: 10 }
    ];

    // Credit score distribution
    this.creditScoreDistribution = [
      { range: '300-500', count: 5, percentage: 10 },
      { range: '500-650', count: 15, percentage: 30 },
      { range: '650-750', count: 20, percentage: 40 },
      { range: '750-850', count: 10, percentage: 20 }
    ];

    // Employment type statistics
    this.employmentTypeStats = [
      { type: 'Employed', count: 25, percentage: 50 },
      { type: 'Self Employed', count: 15, percentage: 30 },
      { type: 'Student', count: 5, percentage: 10 },
      { type: 'Not Employed', count: 5, percentage: 10 }
    ];
  }

  exportAnalytics(): void {
    this.toastService.showSuccess('Export Started', 'Preparing analytics report...');
    
    // Generate comprehensive report
    let report = 'LENDER ANALYTICS REPORT\n';
    report += 'Generated: ' + new Date().toLocaleString() + '\n\n';
    
    report += 'SUMMARY STATISTICS:\n';
    report += `Total Applications: ${this.totalApplications}\n`;
    report += `Pending: ${this.pendingApplications}\n`;
    report += `Approved: ${this.approvedApplications}\n`;
    report += `Rejected: ${this.rejectedApplications}\n`;
    report += `Total Loan Amount: ₹${this.totalLoanAmount.toLocaleString()}\n`;
    report += `Average Loan Amount: ₹${this.averageLoanAmount.toLocaleString()}\n`;
    report += `Approval Rate: ${this.approvalRate.toFixed(1)}%\n`;
    report += `Average Processing Time: ${this.averageProcessingTime} days\n\n`;
    
    report += 'MONTHLY TREND:\n';
    this.monthlyApplications.forEach(month => {
      report += `${month.month}: ${month.applications} total, ${month.approved} approved, ${month.rejected} rejected\n`;
    });
    
    // Download report
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'lender-analytics-report.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      this.toastService.showSuccess('Export Complete', 'Analytics report has been downloaded!');
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/lender/dashboard']);
  }

  getSegmentColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)'
    ];
    return colors[index % colors.length];
  }
}
