import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LenderRule, LoanApplication, User, ApplicationStatus } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface BulkSettings {
  autoApprove: boolean;
  minCreditScore: number;
  maxLoanAmount: number;
  batchSize: number;
}

interface PerformanceMetrics {
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalApprovedAmount: number;
  averageApprovedAmount: number;
  approvalRate: number;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-lender-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lender-dashboard.component.html',
  styleUrl: './lender-dashboard.component.css'
})
export class LenderDashboardComponent implements OnInit {
  currentUser: User | null = null;
  eligibilityRules: LenderRule[] = [];
  loanApplications: LoanApplication[] = [];
  borrowers: User[] = [];
  selectedApplication: LoanApplication | null = null;
  isLoading = false;
  isAdding = false;
  isEditing = false;
  isSaving = false;
  showAddRuleForm = false;
  showApplicationDetails = false;
  showBulkProcessing = false;
  showPerformanceTracking = false;
  isBulkProcessing = false;
  bulkSettings: BulkSettings = {
    autoApprove: false,
    minCreditScore: 650,
    maxLoanAmount: 50000,
    batchSize: 10
  };

  ruleForm: FormGroup;
  applicationForm: FormGroup;
  
  // New features
  // showBulkProcessing = false;
  // showPerformanceTracking = false;
  // isBulkProcessing = false;
  // bulkSettings = {
  //   autoApproveThreshold: 0,
  //   autoRejectThreshold: 0
  // };

  // Inject services
  private authService = inject(AuthService);
  private mockApi = inject(MockApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  constructor() {
    this.ruleForm = this.fb.group({
      minSalary: ['', [Validators.required, Validators.min(1000)]],
      maxLoanAmount: ['', [Validators.required, Validators.min(1000)]],
      minCreditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]],
      maxAge: ['', [Validators.required, Validators.min(18), Validators.max(70)]],
      employmentTypes: ['', Validators.required],
      minLoanAmount: ['', [Validators.required, Validators.min(1000)]]
    });

    this.applicationForm = this.fb.group({
      status: ['', Validators.required],
      comments: [''],
      decisionDate: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser || this.currentUser.role !== 'LENDER') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load eligibility rules
    this.mockApi.getLenderRules().subscribe({
      next: (rules: LenderRule[]) => {
        this.eligibilityRules = rules;
      },
      error: (error: any) => {
        console.error('Error loading eligibility rules:', error);
      }
    });

    // Load loan applications for this lender
    this.mockApi.getLoanApplicationsByLender(this.currentUser!.id!).subscribe({
      next: (applications: any[]) => {
        this.loanApplications = applications;
        this.loadBorrowerDetails(applications);
      },
      error: (error: any) => {
        console.error('Error loading loan applications:', error);
      }
    });
  }

  loadBorrowerDetails(applications: any[]): void {
    const borrowerIds = [...new Set(applications.map(app => app.borrowerId || app.customerId))];
    // For now, just create mock borrower data
    this.borrowers = borrowerIds.map(id => ({
      id: id,
      username: `borrower${id}`,
      email: `borrower${id}@example.com`,
      roles: ['BORROWER'],
      token: `token-${id}`,
      role: 'BORROWER',
      firstName: 'John',
      lastName: 'Doe',
      phone: `+1-555-${id.toString().padStart(4, '0')}`,
      company: 'Personal'
    }));
  }

  getBorrowerName(borrowerId: number): string {
    const borrower = this.borrowers.find(b => b.id === borrowerId);
    return borrower ? `${borrower.firstName} ${borrower.lastName}` : 'Unknown';
  }

  getBorrowerDetails(borrowerId: number): User | undefined {
    return this.borrowers.find(b => b.id === borrowerId);
  }

  addEligibilityRule(): void {
    if (this.ruleForm.valid) {
      this.isLoading = true;
      
      const ruleData = {
        ...this.ruleForm.value,
        lenderId: this.currentUser!.id!
      };

      this.mockApi.createLenderRule(ruleData).subscribe({
        next: (newRule: LenderRule) => {
          this.isLoading = false;
          this.eligibilityRules.push(newRule);
          this.ruleForm.reset({ isActive: true });
          this.showAddRuleForm = false;
          
          // Show success message using toast service
          this.toastService.showSuccess('Rule Created', 'Eligibility rule created successfully!');
          
          // Reload dashboard data
          this.loadDashboardData();
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error creating eligibility rule:', error);
          this.toastService.showError('Error', 'Failed to create rule. Please try again.');
        }
      });
    } else {
      this.toastService.showError('Validation Error', 'Please fill all required fields correctly.');
    }
  }

  showSuccessMessage(message: string): void {
    this.toastService.showSuccess('Success', message);
  }

  showErrorMessage(message: string): void {
    this.toastService.showError('Error', message);
  }

  toggleRuleStatus(rule: LenderRule): void {
    const updatedRule = { ...rule, isActive: !rule.isActive };
    this.mockApi.updateLenderRule(rule.id!, updatedRule).subscribe({
      next: (updated: LenderRule) => {
        const index = this.eligibilityRules.findIndex(r => r.id === rule.id);
        if (index !== -1) {
          this.eligibilityRules[index] = updated;
        }
      },
      error: (error: any) => {
        console.error('Error updating rule status:', error);
      }
    });
  }

  deleteRule(ruleId: number): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.mockApi.deleteLenderRule(ruleId).subscribe({
        next: () => {
          this.eligibilityRules = this.eligibilityRules.filter(r => r.id !== ruleId);
        },
        error: (error: any) => {
          console.error('Error deleting rule:', error);
        }
      });
    }
  }

  viewApplicationDetails(application: LoanApplication): void {
    this.selectedApplication = application;
    this.applicationForm.patchValue({
      status: application.status,
      eligibilityScore: application.eligibilityScore || 0
    });
    this.showApplicationDetails = true;
  }

  updateApplicationStatus(): void {
    if (this.applicationForm.valid && this.selectedApplication) {
      const updates = {
        ...this.applicationForm.value,
        updatedAt: new Date().toISOString(),
        decisionDate: new Date().toISOString(),
        decisionBy: (this.currentUser?.firstName || 'Lender') + ' ' + (this.currentUser?.lastName || 'Manager')
      };

      this.mockApi.updateLoanApplication(this.selectedApplication.id!, updates).subscribe({
        next: (updated: any) => {
          const index = this.loanApplications.findIndex(app => app.id === updated.id);
          if (index !== -1) {
            this.loanApplications[index] = updated;
          }
          this.showApplicationDetails = false;
          this.selectedApplication = null;
          
          this.toastService.showSuccess('Status Updated', 'Application status updated successfully!');
          
          // Reload dashboard data to refresh stats
          this.loadDashboardData();
        },
        error: (error: any) => {
          console.error('Error updating application:', error);
          this.toastService.showError('Error', 'Failed to update application status');
        }
      });
    }
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

  getScoreClass(score: number | undefined): string {
    if (!score) return 'score-low';
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  getPendingCount(): number {
    return this.loanApplications.filter(app => app.status === 'PENDING').length;
  }

  getApprovedCount(): number {
    return this.loanApplications.filter(app => app.status === 'APPROVED').length;
  }

  logout(): void {
    console.log('Lender Dashboard logout clicked');
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // New functionality methods
  exportData(): void {
    console.log('Exporting data...');
    this.toastService.showSuccess('Export Started', 'Preparing data for export...');
    
    // Create CSV data
    const csvData = this.generateCSVData();
    
    // Create and download file
    this.downloadCSV(csvData, 'lender-dashboard-data.csv');
    
    // Show success message
    setTimeout(() => {
      this.toastService.showSuccess('Export Complete', 'Data has been exported successfully!');
      this.addNotification('success', 'Dashboard data has been downloaded as CSV');
    }, 1000);
  }

  private generateCSVData(): string {
    // Generate CSV headers
    let csv = 'Application ID,Borrower Name,Loan Amount,Status,Eligibility Score,Loan Purpose,Term,Date\n';
    
    // Add application data
    this.loanApplications.forEach(app => {
      const borrowerName = this.getBorrowerName(app.borrowerId);
      const amount = app.loanAmount || app.requestedAmount || 0;
      const purpose = app.loanPurpose || 'N/A';
      const term = app.loanTerm || 'N/A';
      const date = new Date().toLocaleDateString();
      
      csv += `${app.id},${borrowerName},${amount},${app.status},${app.eligibilityScore || 'N/A'},${purpose},${term},${date}\n`;
    });
    
    // Add rules data
    csv += '\nRule ID,Min Salary,Min Loan Amount,Max Loan Amount,Min Credit Score,Min Age,Max Age,Employment Types,Status\n';
    this.eligibilityRules.forEach(rule => {
      const employmentTypes = (rule.employmentTypes || []).join(';');
      csv += `${rule.id},${rule.minSalary},${rule.minLoanAmount},${rule.maxLoanAmount},${rule.minCreditScore},${rule.minAge},${rule.maxAge},${employmentTypes},${rule.isActive ? 'Active' : 'Inactive'}\n`;
    });
    
    return csv;
  }

  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  viewAnalytics(): void {
    console.log('Opening analytics...');
    this.router.navigate(['/lender/analytics']);
  }

  sendNotifications(): void {
    console.log('Sending notifications...');
    this.toastService.showSuccess('Notifications Sent', 'Bulk notifications have been sent to all pending applicants.');
  }

  getGrowthRate(): number {
    // Calculate growth rate based on previous month
    const currentCount = this.loanApplications.length;
    const previousCount = Math.floor(currentCount * 0.8); // Mock previous month data
    if (previousCount === 0) return 0;
    return Math.round(((currentCount - previousCount) / previousCount) * 100);
  }

  // Notification methods
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  }

  dismissNotification(index: number): void {
    this.notifications.splice(index, 1);
  }

  addNotification(type: 'info' | 'success' | 'warning' | 'error', message: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      read: false
    };
    this.notifications.unshift(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      const index = this.notifications.findIndex(n => n.id === notification.id);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 5000);
  }

  // New feature methods
  getPendingApplications(): LoanApplication[] {
    return this.loanApplications.filter(app => app.status === 'PENDING');
  }

  processBulkApplications(): void {
    this.isBulkProcessing = true;
    const pendingApps = this.getPendingApplications();
    let processed = 0;

    pendingApps.forEach(app => {
      const score = app.eligibilityScore || 0;
      let newStatus = 'PENDING';

      if (this.bulkSettings.autoApprove && score >= this.bulkSettings.minCreditScore) {
        newStatus = 'APPROVED';
      } else if (score <= 0) { // Assuming a threshold for rejection
        newStatus = 'REJECTED';
      }

      if (newStatus !== 'PENDING') {
        const updates = {
          status: newStatus as any,
          updatedAt: new Date().toISOString(),
          decisionDate: new Date().toISOString(),
          decisionBy: (this.currentUser?.firstName || 'Lender') + ' ' + (this.currentUser?.lastName || 'Manager'),
          comments: `Bulk processed - Auto ${newStatus.toLowerCase()} based on score ${score}`
        };

        this.mockApi.updateLoanApplication(app.id!, updates).subscribe({
          next: (updated: any) => {
            const index = this.loanApplications.findIndex(a => a.id === updated.id);
            if (index !== -1) {
              this.loanApplications[index] = updated;
            }
            processed++;
            
            if (processed === pendingApps.length) {
              this.isBulkProcessing = false;
              this.showBulkProcessing = false;
              this.toastService.showSuccess('Bulk Processing Complete', `Processed ${processed} applications!`);
              this.loadDashboardData();
            }
          },
          error: (error: any) => {
            console.error('Error updating application:', error);
            processed++;
            if (processed === pendingApps.length) {
              this.isBulkProcessing = false;
              this.toastService.showError('Bulk Processing Error', 'Some applications failed to update');
            }
          }
        });
      } else {
        processed++;
        if (processed === pendingApps.length) {
          this.isBulkProcessing = false;
          this.showBulkProcessing = false;
          this.toastService.showSuccess('Bulk Processing Complete', `Processed ${processed} applications!`);
        }
      }
    });
  }

  getTotalApprovedAmount(): number {
    return this.loanApplications
      .filter(app => app.status === 'APPROVED')
      .reduce((sum, app) => sum + (app.loanAmount || app.requestedAmount || 0), 0);
  }

  getAverageApprovedAmount(): number {
    const approvedApps = this.loanApplications.filter(app => app.status === 'APPROVED');
    if (approvedApps.length === 0) return 0;
    return this.getTotalApprovedAmount() / approvedApps.length;
  }

  getApprovalRate(): number {
    if (this.loanApplications.length === 0) return 0;
    const approvedCount = this.loanApplications.filter(app => app.status === 'APPROVED').length;
    return (approvedCount / this.loanApplications.length) * 100;
  }

  get monthlyPerformance(): any[] {
    return [
      { month: 'Jan', approved: 8, rejected: 2, total: 10 },
      { month: 'Feb', approved: 10, rejected: 3, total: 13 },
      { month: 'Mar', approved: 12, rejected: 4, total: 16 },
      { month: 'Apr', approved: 15, rejected: 5, total: 20 },
      { month: 'May', approved: 18, rejected: 5, total: 23 },
      { month: 'Jun', approved: 20, rejected: 6, total: 26 }
    ];
  }

  get topLoanCategories(): any[] {
    const categories = ['Personal', 'Business', 'Education', 'Home', 'Vehicle'];
    return categories.map((name, index) => ({
      name,
      amount: Math.floor(Math.random() * 500000) + 100000,
      count: Math.floor(Math.random() * 20) + 5
    })).sort((a, b) => b.amount - a.amount);
  }

  exportPerformanceReport(): void {
    this.toastService.showSuccess('Export Started', 'Preparing performance report...');
    
    let report = 'LENDER PERFORMANCE REPORT\n';
    report += 'Generated: ' + new Date().toLocaleString() + '\n\n';
    
    report += 'PERFORMANCE SUMMARY:\n';
    report += `Total Approved Loans: ₹${this.getTotalApprovedAmount().toLocaleString()}\n`;
    report += `Total Loan Amount: ₹${this.getTotalApprovedAmount().toLocaleString()}\n`;
    report += `Average Loan Size: ₹${this.getAverageApprovedAmount().toLocaleString()}\n`;
    report += `Approval Rate: ${this.getApprovalRate().toFixed(1)}%\n`;
    report += `Total Applications: ${this.loanApplications.length}\n\n`;
    
    report += 'MONTHLY TREND:\n';
    this.monthlyPerformance.forEach(month => {
      report += `${month.month}: ${month.apped} approved, ${month.rejected} rejected, ${month.total} total\n`;
    });
    
    report += '\nTOP LOAN CATEGORIES:\n';
    this.topLoanCategories.forEach(category => {
      report += `${category.name}: ₹${category.amount.toLocaleString()} (${category.count} loans)\n`;
    });
    
    // Download report
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'lender-performance-report.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      this.toastService.showSuccess('Export Complete', 'Performance report has been downloaded!');
    }, 1000);
  }

  // New extra functionalities
  notifications: Notification[] = [
    {
      id: '1',
      type: 'info',
      message: 'New loan application received from John Doe',
      timestamp: new Date(),
      read: false
    },
    {
      id: '2',
      type: 'success',
      message: 'Bulk processing completed successfully',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: '3',
      type: 'warning',
      message: 'Credit score threshold reached for auto-approval',
      timestamp: new Date(Date.now() - 7200000),
      read: false
    }
  ];

  // Advanced analytics methods
  getPerformanceMetrics(): PerformanceMetrics {
    const total = this.loanApplications.length;
    const approved = this.loanApplications.filter(app => app.status === 'APPROVED').length;
    const rejected = this.loanApplications.filter(app => app.status === 'REJECTED').length;
    const approvedAmounts = this.loanApplications
      .filter(app => app.status === 'APPROVED')
      .map(app => app.loanAmount || 0);
    
    return {
      totalApplications: total,
      approvedApplications: approved,
      rejectedApplications: rejected,
      totalApprovedAmount: approvedAmounts.reduce((sum, amount) => sum + amount, 0),
      averageApprovedAmount: approvedAmounts.length > 0 ? approvedAmounts.reduce((sum, amount) => sum + amount, 0) / approvedAmounts.length : 0,
      approvalRate: total > 0 ? (approved / total) * 100 : 0
    };
  }

  // Risk assessment functionality
  assessRisk(application: LoanApplication): 'low' | 'medium' | 'high' {
    const creditScore = application.creditScore || 0;
    const monthlyIncome = application.monthlyIncome || 0;
    const loanAmount = application.loanAmount || 0;
    
    let riskScore = 0;
    
    // Credit score risk (0-100)
    if (creditScore >= 750) riskScore += 20;
    else if (creditScore >= 650) riskScore += 40;
    else if (creditScore >= 550) riskScore += 60;
    else riskScore += 80;
    
    // Income to loan ratio risk (0-100)
    const incomeRatio = monthlyIncome > 0 ? loanAmount / monthlyIncome : 0;
    if (incomeRatio <= 3) riskScore += 20;
    else if (incomeRatio <= 5) riskScore += 40;
    else if (incomeRatio <= 7) riskScore += 60;
    else riskScore += 80;
    
    // Employment status risk (0-100)
    if (application.employmentStatus === 'full-time') riskScore += 20;
    else if (application.employmentStatus === 'part-time') riskScore += 40;
    else if (application.employmentStatus === 'self-employed') riskScore += 60;
    else riskScore += 80;
    
    const averageRisk = riskScore / 3;
    
    if (averageRisk <= 33) return 'low';
    else if (averageRisk <= 66) return 'medium';
    else return 'high';
  }

  // Smart recommendation system
  getRecommendation(application: LoanApplication): string {
    const risk = this.assessRisk(application);
    const creditScore = application.creditScore || 0;
    const monthlyIncome = application.monthlyIncome || 0;
    
    if (risk === 'low' && creditScore >= 700) {
      return 'Strong candidate - Recommend approval with standard terms';
    } else if (risk === 'medium' && creditScore >= 650) {
      return 'Moderate risk - Consider approval with adjusted terms or additional documentation';
    } else if (risk === 'high' && creditScore >= 600) {
      return 'High risk - Require additional documentation or consider rejection';
    } else {
      return 'Very high risk - Recommend rejection or require significant collateral';
    }
  }

  // Enhanced bulk processing with risk assessment
  async processBulkApplicationsWithRisk(): Promise<void> {
    this.isBulkProcessing = true;
    
    try {
      const pendingApps = this.getPendingApplications();
      const results = {
        approved: 0,
        rejected: 0,
        requiresReview: 0
      };
      
      for (const app of pendingApps) {
        const risk = this.assessRisk(app);
        const recommendation = this.getRecommendation(app);
        
        if (risk === 'low' && this.bulkSettings.autoApprove) {
          await this.approveApplicationWithRisk(app.id, 'Auto-approved based on low risk assessment');
          results.approved++;
        } else if (risk === 'high') {
          await this.rejectApplicationWithRisk(app.id, 'Rejected due to high risk assessment');
          results.rejected++;
        } else {
          results.requiresReview++;
        }
      }
      
      this.toastService.showSuccess('Bulk Processing Complete', `Bulk processing completed: ${results.approved} approved, ${results.rejected} rejected, ${results.requiresReview} require review`);
      
      // Add notification
      this.addNotification('success', `Bulk processing completed: ${results.approved} approved, ${results.rejected} rejected`);
      
    } catch (error) {
      this.toastService.showError('Bulk Processing Error', 'Error during bulk processing');
    } finally {
      this.isBulkProcessing = false;
    }
  }

  // Enhanced application approval with risk assessment
  async approveApplicationWithRisk(applicationId: number, comments: string): Promise<void> {
    try {
      const application = this.loanApplications.find(app => app.id === applicationId);
      if (!application) {
        this.toastService.showError('Error', 'Application not found');
        return;
      }
      
      const risk = this.assessRisk(application);
      const recommendation = this.getRecommendation(application);
      
      // Update application with risk assessment
      const updatedApp = {
        ...application,
        status: 'APPROVED' as ApplicationStatus,
        comments: `${comments}\n\nRisk Assessment: ${risk.toUpperCase()}\nRecommendation: ${recommendation}`,
        decisionDate: new Date().toISOString(),
        decisionBy: (this.currentUser?.firstName || 'Lender') + ' ' + (this.currentUser?.lastName || 'Manager')
      };
      
      await this.mockApi.updateLoanApplication(applicationId, updatedApp).toPromise();
      this.loadDashboardData();
      
      this.toastService.showSuccess('Application Approved', `Application approved. Risk level: ${risk}`);
      this.addNotification('success', `Loan application approved for Customer ID: ${application.customerId}`);
      
    } catch (error) {
      this.toastService.showError('Error', 'Error approving application');
    }
  }

  // Enhanced application rejection with risk assessment
  async rejectApplicationWithRisk(applicationId: number, comments: string): Promise<void> {
    try {
      const application = this.loanApplications.find(app => app.id === applicationId);
      if (!application) {
        this.toastService.showError('Error', 'Application not found');
        return;
      }
      
      const risk = this.assessRisk(application);
      const recommendation = this.getRecommendation(application);
      
      // Update application with risk assessment
      const updatedApp = {
        ...application,
        status: 'REJECTED' as ApplicationStatus,
        comments: `${comments}\n\nRisk Assessment: ${risk.toUpperCase()}\nRecommendation: ${recommendation}`,
        decisionDate: new Date().toISOString(),
        decisionBy: (this.currentUser?.firstName || 'Lender') + ' ' + (this.currentUser?.lastName || 'Manager')
      };
      
      await this.mockApi.updateLoanApplication(applicationId, updatedApp).toPromise();
      this.loadDashboardData();
      
      this.toastService.showWarning('Application Rejected', `Application rejected. Risk level: ${risk}`);
      this.addNotification('warning', `Loan application rejected for Customer ID: ${application.customerId}`);
      
    } catch (error) {
      this.toastService.showError('Error', 'Error rejecting application');
    }
  }

  // NEW EXTRA FUNCTIONALITIES

  // Loan Portfolio Management
  getPortfolioMetrics(): any {
    const totalPortfolio = this.getTotalApprovedAmount();
    const activeLoans = this.loanApplications.filter(app => app.status === 'APPROVED').length;
    const averageLoanSize = this.getAverageApprovedAmount();
    const portfolioGrowth = this.calculatePortfolioGrowth();
    
    return {
      totalPortfolio,
      activeLoans,
      averageLoanSize,
      portfolioGrowth,
      riskDistribution: this.getRiskDistribution(),
      loanPurposeBreakdown: this.getLoanPurposeBreakdown(),
      termDistribution: this.getTermDistribution()
    };
  }

  private calculatePortfolioGrowth(): number {
    // Mock calculation - in real app, this would compare with previous periods
    const currentAmount = this.getTotalApprovedAmount();
    const previousAmount = currentAmount * 0.85; // Mock previous period
    return previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0;
  }

  private getRiskDistribution(): any {
    const applications = this.loanApplications.filter(app => app.status === 'APPROVED');
    const lowRisk = applications.filter(app => this.assessRisk(app) === 'low').length;
    const mediumRisk = applications.filter(app => this.assessRisk(app) === 'medium').length;
    const highRisk = applications.filter(app => this.assessRisk(app) === 'high').length;
    
    return { lowRisk, mediumRisk, highRisk, total: applications.length };
  }

  private getLoanPurposeBreakdown(): any[] {
    const applications = this.loanApplications.filter(app => app.status === 'APPROVED');
    const purposeMap = new Map<string, { count: number; amount: number }>();
    
    applications.forEach(app => {
      const purpose = app.loanPurpose || 'Other';
      const current = purposeMap.get(purpose) || { count: 0, amount: 0 };
      purposeMap.set(purpose, {
        count: current.count + 1,
        amount: current.amount + (app.loanAmount || 0)
      });
    });
    
    return Array.from(purposeMap.entries()).map(([purpose, data]) => ({
      purpose,
      count: data.count,
      amount: data.amount,
      percentage: (data.count / applications.length) * 100
    })).sort((a, b) => b.amount - a.amount);
  }

  private getTermDistribution(): any[] {
    const applications = this.loanApplications.filter(app => app.status === 'APPROVED');
    const termMap = new Map<number, number>();
    
    applications.forEach(app => {
      const term = app.loanTerm || 12;
      termMap.set(term, (termMap.get(term) || 0) + 1);
    });
    
    return Array.from(termMap.entries()).map(([term, count]) => ({
      term: `${term} months`,
      count,
      percentage: (count / applications.length) * 100
    })).sort((a, b) => a.term.localeCompare(b.term));
  }

  // Customer Insights and Analytics
  getCustomerInsights(): any {
    const applications = this.loanApplications.filter(app => app.status === 'APPROVED');
    const customers = new Set(applications.map(app => app.customerId));
    
    return {
      totalCustomers: customers.size,
      repeatCustomers: this.getRepeatCustomers(applications),
      customerSegments: this.getCustomerSegments(applications),
      topCustomers: this.getTopCustomers(applications),
      customerRetentionRate: this.calculateCustomerRetentionRate(applications)
    };
  }

  private getRepeatCustomers(applications: LoanApplication[]): any[] {
    const customerCounts = new Map<number, number>();
    applications.forEach(app => {
      customerCounts.set(app.customerId, (customerCounts.get(app.customerId) || 0) + 1);
    });
    
    return Array.from(customerCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([customerId, count]) => ({
        customerId,
        loanCount: count,
        totalAmount: applications
          .filter(app => app.customerId === customerId)
          .reduce((sum, app) => sum + (app.loanAmount || 0), 0)
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }

  private getCustomerSegments(applications: LoanApplication[]): any[] {
    const segments = [
      { name: 'High-Value', minAmount: 50000, count: 0, totalAmount: 0 },
      { name: 'Medium-Value', minAmount: 20000, count: 0, totalAmount: 0 },
      { name: 'Low-Value', minAmount: 0, count: 0, totalAmount: 0 }
    ];
    
    applications.forEach(app => {
      const amount = app.loanAmount || 0;
      if (amount >= 50000) {
        segments[0].count++;
        segments[0].totalAmount += amount;
      } else if (amount >= 20000) {
        segments[1].count++;
        segments[1].totalAmount += amount;
      } else {
        segments[2].count++;
        segments[2].totalAmount += amount;
      }
    });
    
    return segments.map(segment => ({
      ...segment,
      averageAmount: segment.count > 0 ? segment.totalAmount / segment.count : 0,
      percentage: (segment.count / applications.length) * 100
    }));
  }

  private getTopCustomers(applications: LoanApplication[]): any[] {
    const customerTotals = new Map<number, number>();
    
    applications.forEach(app => {
      customerTotals.set(app.customerId, 
        (customerTotals.get(app.customerId) || 0) + (app.loanAmount || 0)
      );
    });
    
    return Array.from(customerTotals.entries())
      .map(([customerId, totalAmount]) => ({
        customerId,
        totalAmount,
        loanCount: applications.filter(app => app.customerId === customerId).length
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }

  private calculateCustomerRetentionRate(applications: LoanApplication[]): number {
    const uniqueCustomers = new Set(applications.map(app => app.customerId));
    const repeatCustomers = this.getRepeatCustomers(applications).length;
    return uniqueCustomers.size > 0 ? (repeatCustomers / uniqueCustomers.size) * 100 : 0;
  }

  // Advanced Reporting and Export
  generateComprehensiveReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      portfolioMetrics: this.getPortfolioMetrics(),
      customerInsights: this.getCustomerInsights(),
      performanceMetrics: this.getPerformanceMetrics(),
      riskAnalysis: this.getRiskAnalysis(),
      recommendations: this.getStrategicRecommendations()
    };
    
    // Create and download JSON report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lender-comprehensive-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    this.toastService.showSuccess('Report Generated', 'Comprehensive report has been downloaded');
    this.addNotification('success', 'Comprehensive report generated and downloaded');
  }

  private getRiskAnalysis(): any {
    const applications = this.loanApplications.filter(app => app.status === 'APPROVED');
    const riskScores = applications.map(app => this.calculateRiskScore(app));
    
    return {
      averageRiskScore: riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length,
      riskDistribution: this.getRiskDistribution(),
      highRiskApplications: applications.filter(app => this.assessRisk(app) === 'high').length,
      riskTrends: this.calculateRiskTrends(applications)
    };
  }

  private calculateRiskScore(application: LoanApplication): number {
    const creditScore = application.creditScore || 0;
    const monthlyIncome = application.monthlyIncome || 0;
    const loanAmount = application.loanAmount || 0;
    
    let score = 0;
    
    // Credit score component (0-40 points)
    if (creditScore >= 750) score += 40;
    else if (creditScore >= 700) score += 30;
    else if (creditScore >= 650) score += 20;
    else if (creditScore >= 600) score += 10;
    
    // Income to loan ratio component (0-30 points)
    const incomeRatio = monthlyIncome > 0 ? loanAmount / monthlyIncome : 0;
    if (incomeRatio <= 3) score += 30;
    else if (incomeRatio <= 5) score += 20;
    else if (incomeRatio <= 7) score += 10;
    
    // Employment status component (0-30 points)
    if (application.employmentStatus === 'full-time') score += 30;
    else if (application.employmentStatus === 'part-time') score += 20;
    else if (application.employmentStatus === 'self-employed') score += 15;
    
    return score;
  }

  private calculateRiskTrends(applications: LoanApplication[]): any[] {
    // Mock trend calculation - in real app, this would analyze historical data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      averageRiskScore: 70 - (index * 2) + Math.random() * 10, // Mock decreasing trend
      applicationCount: Math.floor(Math.random() * 20) + 10
    }));
  }

  private getStrategicRecommendations(): string[] {
    const recommendations: string[] = [];
    const portfolioMetrics = this.getPortfolioMetrics();
    const customerInsights = this.getCustomerInsights();
    
    if (portfolioMetrics.portfolioGrowth < 5) {
      recommendations.push('Consider lowering credit score requirements to increase approval rates');
    }
    
    if (customerInsights.customerRetentionRate < 30) {
      recommendations.push('Implement customer loyalty programs to improve retention');
    }
    
    if (portfolioMetrics.riskDistribution.highRisk > portfolioMetrics.riskDistribution.lowRisk) {
      recommendations.push('Review lending criteria to reduce high-risk applications');
    }
    
    if (customerInsights.totalCustomers < 100) {
      recommendations.push('Focus on customer acquisition strategies to grow portfolio');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Portfolio is performing well. Continue current strategies.');
    }
    
    return recommendations;
  }

  // Smart Loan Matching Enhancement
  getSmartLoanRecommendations(application: LoanApplication): any {
    const risk = this.assessRisk(application);
    const creditScore = application.creditScore || 0;
    const monthlyIncome = application.monthlyIncome || 0;
    const requestedAmount = application.requestedAmount || 0;
    
    let recommendedAmount = requestedAmount;
    let recommendedTerm = application.loanTerm || 12;
    let interestRate = 0;
    
    // Adjust amount based on risk and income
    if (risk === 'low' && creditScore >= 700) {
      recommendedAmount = Math.min(requestedAmount * 1.2, monthlyIncome * 5);
      interestRate = 8.5;
    } else if (risk === 'medium' && creditScore >= 650) {
      recommendedAmount = Math.min(requestedAmount, monthlyIncome * 4);
      interestRate = 12.5;
    } else {
      recommendedAmount = Math.min(requestedAmount * 0.8, monthlyIncome * 3);
      interestRate = 16.5;
    }
    
    // Adjust term based on amount
    if (recommendedAmount > 50000) {
      recommendedTerm = Math.max(24, recommendedTerm);
    } else if (recommendedAmount < 10000) {
      recommendedTerm = Math.min(12, recommendedTerm);
    }
    
    return {
      recommendedAmount: Math.round(recommendedAmount),
      recommendedTerm,
      interestRate,
      monthlyPayment: this.calculateMonthlyPayment(recommendedAmount, recommendedTerm, interestRate),
      riskLevel: risk,
      confidence: this.calculateConfidenceScore(application),
      alternativeOptions: this.getAlternativeLoanOptions(application)
    };
  }

  private calculateMonthlyPayment(principal: number, term: number, annualRate: number): number {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = term;
    
    if (monthlyRate === 0) return principal / numberOfPayments;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  private calculateConfidenceScore(application: LoanApplication): number {
    const creditScore = application.creditScore || 0;
    const monthlyIncome = application.monthlyIncome || 0;
    const employmentStatus = application.employmentStatus;
    
    let score = 0;
    
    // Credit score confidence (0-40)
    if (creditScore >= 750) score += 40;
    else if (creditScore >= 700) score += 35;
    else if (creditScore >= 650) score += 30;
    else if (creditScore >= 600) score += 25;
    else score += 20;
    
    // Income confidence (0-30)
    if (monthlyIncome >= 50000) score += 30;
    else if (monthlyIncome >= 30000) score += 25;
    else if (monthlyIncome >= 20000) score += 20;
    else if (monthlyIncome >= 10000) score += 15;
    else score += 10;
    
    // Employment confidence (0-30)
    if (employmentStatus === 'full-time') score += 30;
    else if (employmentStatus === 'part-time') score += 20;
    else if (employmentStatus === 'self-employed') score += 15;
    else score += 10;
    
    return Math.min(score, 100);
  }

  private getAlternativeLoanOptions(application: LoanApplication): any[] {
    const alternatives = [];
    const requestedAmount = application.requestedAmount || 0;
    
    // Personal loan alternative
    alternatives.push({
      type: 'Personal Loan',
      amount: Math.round(requestedAmount * 0.8),
      term: 12,
      interestRate: 14.5,
      monthlyPayment: this.calculateMonthlyPayment(requestedAmount * 0.8, 12, 14.5)
    });
    
    // Secured loan alternative
    alternatives.push({
      type: 'Secured Loan',
      amount: Math.round(requestedAmount * 1.2),
      term: 24,
      interestRate: 9.5,
      monthlyPayment: this.calculateMonthlyPayment(requestedAmount * 1.2, 24, 9.5),
      requiresCollateral: true
    });
    
    // Micro loan alternative
    if (requestedAmount > 10000) {
      alternatives.push({
        type: 'Micro Loan',
        amount: 10000,
        term: 6,
        interestRate: 18.5,
        monthlyPayment: this.calculateMonthlyPayment(10000, 6, 18.5)
      });
    }
    
    return alternatives;
  }

  // NEW: Loan Comparison Tool
  compareLoanScenarios(scenarios: any[]): any[] {
    return scenarios.map(scenario => {
      const monthlyPayment = this.calculateMonthlyPayment(scenario.amount, scenario.term, scenario.interestRate);
      const totalInterest = (monthlyPayment * scenario.term) - scenario.amount;
      const totalPayment = monthlyPayment * scenario.term;
      const apr = this.calculateAPR(scenario.amount, monthlyPayment, scenario.term);
      
      return {
        ...scenario,
        monthlyPayment,
        totalInterest,
        totalPayment,
        apr,
        affordability: this.calculateAffordabilityScore(scenario.amount, scenario.term, scenario.interestRate),
        riskScore: this.calculateScenarioRiskScore(scenario)
      };
    }).sort((a, b) => a.affordability - b.affordability);
  }

  private calculateAPR(principal: number, monthlyPayment: number, term: number): number {
    // Simplified APR calculation
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - principal;
    const annualRate = (totalInterest / principal) / (term / 12) * 100;
    return Math.round(annualRate * 100) / 100;
  }

  private calculateAffordabilityScore(amount: number, term: number, interestRate: number): number {
    const monthlyPayment = this.calculateMonthlyPayment(amount, term, interestRate);
    const incomeToPaymentRatio = 50000 / monthlyPayment; // Assuming average income of 50k
    
    let score = 0;
    
    // Payment to income ratio (0-40 points)
    if (incomeToPaymentRatio >= 5) score += 40;
    else if (incomeToPaymentRatio >= 4) score += 35;
    else if (incomeToPaymentRatio >= 3) score += 30;
    else if (incomeToPaymentRatio >= 2) score += 20;
    else score += 10;
    
    // Term length (0-30 points)
    if (term <= 12) score += 30;
    else if (term <= 24) score += 25;
    else if (term <= 36) score += 20;
    else if (term <= 48) score += 15;
    else score += 10;
    
    // Interest rate (0-30 points)
    if (interestRate <= 8) score += 30;
    else if (interestRate <= 12) score += 25;
    else if (interestRate <= 16) score += 20;
    else if (interestRate <= 20) score += 15;
    else score += 10;
    
    return score;
  }

  private calculateScenarioRiskScore(scenario: any): number {
    let riskScore = 0;
    
    // Amount risk (0-30 points)
    if (scenario.amount <= 10000) riskScore += 10;
    else if (scenario.amount <= 25000) riskScore += 20;
    else if (scenario.amount <= 50000) riskScore += 25;
    else riskScore += 30;
    
    // Term risk (0-30 points)
    if (scenario.term <= 12) riskScore += 10;
    else if (scenario.term <= 24) riskScore += 20;
    else if (scenario.term <= 36) riskScore += 25;
    else riskScore += 30;
    
    // Interest rate risk (0-40 points)
    if (scenario.interestRate <= 8) riskScore += 10;
    else if (scenario.interestRate <= 12) riskScore += 20;
    else if (scenario.interestRate <= 16) riskScore += 30;
    else riskScore += 40;
    
    return riskScore;
  }

  // NEW: Generate Loan Comparison Report
  generateLoanComparisonReport(scenarios: any[]): void {
    const comparison = this.compareLoanScenarios(scenarios);
    
    const report = {
      timestamp: new Date().toISOString(),
      scenarios: comparison,
      summary: {
        bestAffordability: comparison[0],
        lowestRisk: comparison.sort((a, b) => a.riskScore - b.riskScore)[0],
        mostProfitable: comparison.sort((a, b) => b.totalInterest - a.totalInterest)[0],
        recommendations: this.generateComparisonRecommendations(comparison)
      }
    };
    
    // Create and download comparison report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `loan-comparison-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    this.toastService.showSuccess('Comparison Report', 'Loan comparison report has been downloaded');
    this.addNotification('success', 'Loan comparison report generated and downloaded');
  }

  private generateComparisonRecommendations(scenarios: any[]): string[] {
    const recommendations: string[] = [];
    
    const avgAffordability = scenarios.reduce((sum, s) => sum + s.affordability, 0) / scenarios.length;
    const avgRisk = scenarios.reduce((sum, s) => sum + s.riskScore, 0) / scenarios.length;
    
    if (avgAffordability < 50) {
      recommendations.push('Consider reducing loan amounts or extending terms to improve affordability');
    }
    
    if (avgRisk > 70) {
      recommendations.push('Risk levels are high - consider adjusting interest rates or requiring collateral');
    }
    
    const bestScenario = scenarios[0];
    if (bestScenario.affordability >= 80) {
      recommendations.push(`Scenario "${bestScenario.name || 'Option 1'}" offers the best affordability`);
    }
    
    const lowRiskScenario = scenarios.sort((a, b) => a.riskScore - b.riskScore)[0];
    if (lowRiskScenario.riskScore <= 30) {
      recommendations.push(`Scenario "${lowRiskScenario.name || 'Option 1'}" has the lowest risk profile`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All scenarios are well-balanced. Choose based on specific business requirements.');
    }
    
    return recommendations;
  }

  // NEW: Quick Loan Scenario Generator
  generateQuickScenarios(baseAmount: number, baseTerm: number): any[] {
    const scenarios = [];
    
    // Conservative scenario
    scenarios.push({
      name: 'Conservative',
      amount: Math.round(baseAmount * 0.8),
      term: Math.max(12, baseTerm - 6),
      interestRate: 8.5,
      description: 'Lower amount, shorter term, lower interest'
    });
    
    // Standard scenario
    scenarios.push({
      name: 'Standard',
      amount: baseAmount,
      term: baseTerm,
      interestRate: 12.5,
      description: 'Original terms with market rate'
    });
    
    // Aggressive scenario
    scenarios.push({
      name: 'Aggressive',
      amount: Math.round(baseAmount * 1.2),
      term: baseTerm + 12,
      interestRate: 16.5,
      description: 'Higher amount, longer term, higher interest'
    });
    
    // Flexible scenario
    scenarios.push({
      name: 'Flexible',
      amount: Math.round(baseAmount * 0.9),
      term: baseTerm,
      interestRate: 10.5,
      description: 'Slightly reduced amount with competitive rate'
    });
    
    return scenarios;
  }

  // Loan Comparison Tool Properties and Methods
  comparisonBaseAmount = 50000;
  comparisonBaseTerm = 24;
  comparisonScenarios: any[] = [];

  generateComparisonScenarios(): void {
    const baseScenarios = this.generateQuickScenarios(this.comparisonBaseAmount, this.comparisonBaseTerm);
    this.comparisonScenarios = this.compareLoanScenarios(baseScenarios);
    this.toastService.showSuccess('Scenarios Generated', 'Loan comparison scenarios have been generated');
  }

  clearComparison(): void {
    this.comparisonScenarios = [];
    this.toastService.showInfo('Comparison Cleared', 'Loan comparison has been cleared');
  }

  getAffordabilityClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  getRiskClass(score: number): string {
    if (score <= 30) return 'low';
    if (score <= 60) return 'medium';
    return 'high';
  }
}
