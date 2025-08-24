import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, LoanApplication, Lender, EligibilityRule } from '../../../core/services/api.service';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

export interface AnalyticsData {
  totalUsers: number;
  totalLenders: number;
  totalApplications: number;
  totalLoanAmount: number;
  approvalRate: number;
  averageProcessingTime: number;
  monthlyApplications: { month: string; count: number; amount: number }[];
  topLenders: { lender: Lender; applications: number; approvalRate: number }[];
  applicationStatuses: { status: string; count: number; percentage: number }[];
  loanAmountRanges: { range: string; count: number; percentage: number }[];
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.css'
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  analyticsData: AnalyticsData | null = null;
  isLoading = false;
  refreshInterval: any;
  lastUpdated: Date = new Date();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser || this.currentUser.role !== 'ADMIN') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadAnalyticsData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.loadAnalyticsData();
    }, 30000); // Refresh every 30 seconds
  }

  loadAnalyticsData(): void {
    this.isLoading = true;
    
    // Load all data in parallel
    Promise.all([
      this.apiService.getUsers().toPromise(),
      this.apiService.getLenders().toPromise(),
      this.apiService.getLoanApplications().toPromise(),
      this.apiService.getEligibilityRules().toPromise()
    ]).then(([users, lenders, applications, rules]) => {
      if (users && lenders && applications && rules) {
        this.analyticsData = this.calculateAnalytics(users as any, lenders, applications, rules);
        this.lastUpdated = new Date();
      }
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading analytics data:', error);
      this.isLoading = false;
    });
  }

  calculateAnalytics(users: User[], lenders: Lender[], applications: LoanApplication[], rules: EligibilityRule[]): AnalyticsData {
    const totalUsers = users.filter(u => u.role === 'BORROWER').length;
    const totalLenders = lenders.length;
    const totalApplications = applications.length;
    const totalLoanAmount = applications.reduce((sum, app) => sum + (app.loanAmount || 0), 0);
    
    const approvedApps = applications.filter(app => app.status === 'APPROVED').length;
    const approvalRate = totalApplications > 0 ? (approvedApps / totalApplications) * 100 : 0;
    
    const processingTimes = applications
      .filter(app => app.status !== 'PENDING' && app.updatedAt)
      .map(app => {
        const created = new Date(app.createdAt);
        const updated = new Date(app.updatedAt!);
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // Days
      });
    
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    // Monthly applications for last 6 months
    const monthlyApplications = this.calculateMonthlyApplications(applications);
    
    // Top lenders by application count
    const topLenders = this.calculateTopLenders(lenders, applications);
    
    // Application status distribution
    const applicationStatuses = this.calculateApplicationStatuses(applications);
    
    // Loan amount ranges
    const loanAmountRanges = this.calculateLoanAmountRanges(applications);

    return {
      totalUsers,
      totalLenders,
      totalApplications,
      totalLoanAmount,
      approvalRate: Math.round(approvalRate * 100) / 100,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100,
      monthlyApplications,
      topLenders,
      applicationStatuses,
      loanAmountRanges
    };
  }

  calculateMonthlyApplications(applications: LoanApplication[]): { month: string; count: number; amount: number }[] {
    const months: Record<string, { count: number; amount: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      months[monthKey] = { count: 0, amount: 0 };
    }
    
    // Count applications by month
    applications.forEach(app => {
      const date = new Date(app.createdAt);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (months[monthKey]) {
        months[monthKey].count++;
        months[monthKey].amount += app.loanAmount || 0;
      }
    });
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      count: data.count,
      amount: data.amount
    }));
  }

  calculateTopLenders(lenders: Lender[], applications: LoanApplication[]): { lender: Lender; applications: number; approvalRate: number }[] {
    return lenders.map(lender => {
      const lenderApps = applications.filter(app => app.lenderId === lender.id);
      const totalApps = lenderApps.length;
      const approvedApps = lenderApps.filter(app => app.status === 'APPROVED').length;
      const approvalRate = totalApps > 0 ? (approvedApps / totalApps) * 100 : 0;
      
      return {
        lender,
        applications: totalApps,
        approvalRate: Math.round(approvalRate * 100) / 100
      };
    })
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 5);
  }

  calculateApplicationStatuses(applications: LoanApplication[]): { status: string; count: number; percentage: number }[] {
    const statusCounts: Record<string, number> = {};
    const total = applications.length;
    
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }

  calculateLoanAmountRanges(applications: LoanApplication[]): { range: string; count: number; percentage: number }[] {
    const ranges = [
      { min: 0, max: 50000, label: '₹0 - ₹50K' },
      { min: 50000, max: 200000, label: '₹50K - ₹2L' },
      { min: 200000, max: 500000, label: '₹2L - ₹5L' },
      { min: 500000, max: 1000000, label: '₹5L - ₹10L' },
      { min: 1000000, max: Infinity, label: '₹10L+' }
    ];
    
    const rangeCounts = ranges.map(range => {
      const count = applications.filter(app => 
        (app.loanAmount || 0) >= range.min && (app.loanAmount || 0) < range.max
      ).length;
      return {
        range: range.label,
        count,
        percentage: Math.round((count / applications.length) * 100)
      };
    });
    
    return rangeCounts.filter(r => r.count > 0);
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      case 'UNDER_REVIEW': return 'status-review';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'PENDING': return '⏳';
      case 'REJECTED': return '❌';
      case 'UNDER_REVIEW': return '🔍';
      default: return '📋';
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

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
  }

  getBarHeight(count: number): number {
    if (!this.analyticsData?.monthlyApplications?.length) return 0;
    const maxCount = Math.max(...this.analyticsData.monthlyApplications.map(m => m.count));
    return maxCount > 0 ? (count / maxCount) * 200 : 0;
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
