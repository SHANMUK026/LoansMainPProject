import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { ApiService, User, Lender, LoanApplication, EligibilityRule } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;
  let fixture: ComponentFixture<AnalyticsDashboardComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'admin',
    email: 'admin@test.com',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    phone: '1234567890'
  };

  const mockLenders: Lender[] = [
    {
      id: 1,
      userId: 2,
      companyName: 'Test Bank',
      lendingLicense: 'LIC001',
      minLoanAmount: 10000,
      maxLoanAmount: 1000000,
      minCreditScore: 600,
      minMonthlyIncome: 25000,
      minAge: 21,
      maxAge: 65,
      interestRateRange: { min: 8, max: 18 },
      loanTerms: [12, 24, 36, 60],
      specializations: ['Personal', 'Business'],
      isActive: true
    }
  ];

  const mockApplications: LoanApplication[] = [
    {
      id: 1,
      borrowerId: 3,
      lenderId: 1,
      loanAmount: 50000,
      loanPurpose: 'Personal',
      loanTerm: 24,
      monthlyIncome: 35000,
      creditScore: 650,
      employmentStatus: 'EMPLOYED',
      documents: [],
      status: 'APPROVED',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];

  const mockRules: EligibilityRule[] = [
    {
      id: 1,
      lenderId: 1,
      ruleName: 'Standard Rule',
      minLoanAmount: 10000,
      maxLoanAmount: 1000000,
      minCreditScore: 600,
      minMonthlyIncome: 25000,
      minAge: 21,
      maxAge: 65,
      employmentTypes: ['EMPLOYED'],
      interestRate: 12,
      processingFee: 500,
      isActive: true
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getUsers', 'getLenders', 'getLoanApplications', 'getEligibilityRules'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockUser
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AnalyticsDashboardComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default return values
    mockApiService.getUsers.and.returnValue(of([mockUser]));
    mockApiService.getLenders.and.returnValue(of(mockLenders));
    mockApiService.getLoanApplications.and.returnValue(of(mockApplications));
    mockApiService.getEligibilityRules.and.returnValue(of(mockRules));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    fixture.detectChanges();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should redirect non-admin users to login', () => {
    const nonAdminUser = { ...mockUser, role: 'BORROWER' as const };
    mockAuthService.currentUser = nonAdminUser;
    
    fixture.detectChanges();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load analytics data on init', () => {
    fixture.detectChanges();
    
    expect(mockApiService.getUsers).toHaveBeenCalled();
    expect(mockApiService.getLenders).toHaveBeenCalled();
    expect(mockApiService.getLoanApplications).toHaveBeenCalled();
    expect(mockApiService.getEligibilityRules).toHaveBeenCalled();
  });

  it('should calculate analytics correctly', () => {
    fixture.detectChanges();
    
    expect(component.analyticsData).toBeTruthy();
    if (component.analyticsData) {
      expect(component.analyticsData.totalUsers).toBe(1);
      expect(component.analyticsData.totalLenders).toBe(1);
      expect(component.analyticsData.totalApplications).toBe(1);
      expect(component.analyticsData.totalLoanAmount).toBe(50000);
      expect(component.analyticsData.approvalRate).toBe(100);
    }
  });

  it('should calculate monthly applications correctly', () => {
    fixture.detectChanges();
    
    if (component.analyticsData) {
      const monthlyData = component.analyticsData.monthlyApplications;
      expect(monthlyData.length).toBe(6); // Last 6 months
      expect(monthlyData.some(m => m.count > 0)).toBe(true);
    }
  });

  it('should calculate top lenders correctly', () => {
    fixture.detectChanges();
    
    if (component.analyticsData) {
      const topLenders = component.analyticsData.topLenders;
      expect(topLenders.length).toBeGreaterThan(0);
      expect(topLenders[0].applications).toBe(1);
      expect(topLenders[0].approvalRate).toBe(100);
    }
  });

  it('should calculate application statuses correctly', () => {
    fixture.detectChanges();
    
    if (component.analyticsData) {
      const statuses = component.analyticsData.applicationStatuses;
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses.find(s => s.status === 'APPROVED')?.count).toBe(1);
    }
  });

  it('should calculate loan amount ranges correctly', () => {
    fixture.detectChanges();
    
    if (component.analyticsData) {
      const ranges = component.analyticsData.loanAmountRanges;
      expect(ranges.length).toBeGreaterThan(0);
      expect(ranges.some(r => r.count > 0)).toBe(true);
    }
  });

  it('should refresh data when refresh button is clicked', () => {
    fixture.detectChanges();
    
    component.refreshData();
    
    expect(mockApiService.getUsers).toHaveBeenCalledTimes(2);
    expect(mockApiService.getLenders).toHaveBeenCalledTimes(2);
    expect(mockApiService.getLoanApplications).toHaveBeenCalledTimes(2);
    expect(mockApiService.getEligibilityRules).toHaveBeenCalledTimes(2);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(50000);
    expect(formatted).toContain('₹');
    expect(formatted).toContain('50,000');
  });

  it('should format numbers correctly', () => {
    const formatted = component.formatNumber(1000000);
    expect(formatted).toBe('1,000,000');
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass('APPROVED')).toBe('status-approved');
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('REJECTED')).toBe('status-rejected');
    expect(component.getStatusClass('UNDER_REVIEW')).toBe('status-review');
  });

  it('should get correct status icon', () => {
    expect(component.getStatusIcon('APPROVED')).toBe('✅');
    expect(component.getStatusIcon('PENDING')).toBe('⏳');
    expect(component.getStatusIcon('REJECTED')).toBe('❌');
    expect(component.getStatusIcon('UNDER_REVIEW')).toBe('🔍');
  });

  it('should handle errors gracefully', () => {
    mockApiService.getUsers.and.returnValue(of([]));
    mockApiService.getLenders.and.returnValue(of([]));
    mockApiService.getLoanApplications.and.returnValue(of([]));
    mockApiService.getEligibilityRules.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(component.analyticsData).toBeTruthy();
    if (component.analyticsData) {
      expect(component.analyticsData.totalUsers).toBe(0);
      expect(component.analyticsData.totalApplications).toBe(0);
    }
  });

  it('should start auto-refresh on init', () => {
    spyOn(window, 'setInterval');
    
    fixture.detectChanges();
    
    expect(window.setInterval).toHaveBeenCalled();
  });

  it('should clear interval on destroy', () => {
    spyOn(window, 'clearInterval');
    
    fixture.detectChanges();
    component.ngOnDestroy();
    
    expect(window.clearInterval).toHaveBeenCalled();
  });

  it('should show loading state while fetching data', () => {
    expect(component.isLoading).toBe(false);
    
    component.loadAnalyticsData();
    
    expect(component.isLoading).toBe(true);
  });

  it('should update lastUpdated timestamp after data load', () => {
    const initialTime = component.lastUpdated;
    
    fixture.detectChanges();
    
    expect(component.lastUpdated.getTime()).toBeGreaterThan(initialTime.getTime());
  });
});
