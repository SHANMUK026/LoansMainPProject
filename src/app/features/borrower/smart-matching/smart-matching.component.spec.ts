import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SmartMatchingComponent } from './smart-matching.component';
import { ApiService, User, Lender, EligibilityRule } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

describe('SmartMatchingComponent', () => {
  let component: SmartMatchingComponent;
  let fixture: ComponentFixture<SmartMatchingComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'borrower',
    email: 'borrower@test.com',
    role: 'BORROWER',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    monthlyIncome: 50000,
    creditScore: 750,
    dateOfBirth: '1990-01-01'
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
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getLenders']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockUser
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SmartMatchingComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockApiService.getLenders.and.returnValue(of(mockLenders));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartMatchingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    fixture.detectChanges();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should redirect non-borrower users to login', () => {
    const nonBorrowerUser = { ...mockUser, role: 'LENDER' as const };
    mockAuthService.currentUser = nonBorrowerUser;
    
    fixture.detectChanges();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load lender matches on init', () => {
    fixture.detectChanges();
    
    expect(mockApiService.getLenders).toHaveBeenCalled();
    expect(component.lenderMatches.length).toBeGreaterThan(0);
  });

  it('should calculate match scores correctly', () => {
    fixture.detectChanges();
    
    const match = component.lenderMatches[0];
    expect(match.matchScore).toBeGreaterThan(0);
    expect(match.matchReasons.length).toBeGreaterThan(0);
    expect(match.eligibilityStatus).toBeDefined();
  });

  it('should calculate age correctly from date of birth', () => {
    const age = component.calculateAge('1990-01-01');
    const currentYear = new Date().getFullYear();
    expect(age).toBe(currentYear - 1990);
  });

  it('should sort lenders by match score', () => {
    fixture.detectChanges();
    
    component.sortByMatchScore();
    
    const scores = component.lenderMatches.map(m => m.matchScore);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1]).toBeGreaterThanOrEqual(scores[i]);
    }
  });

  it('should apply filters correctly', () => {
    fixture.detectChanges();
    
    component.selectedFilters.minMatchScore = 80;
    component.applyFilters();
    
    const filteredMatches = component.lenderMatches.filter(m => m.matchScore >= 80);
    expect(component.lenderMatches.length).toBe(filteredMatches.length);
  });

  it('should reset filters correctly', () => {
    component.selectedFilters.minMatchScore = 90;
    component.selectedFilters.maxInterestRate = 10;
    component.selectedFilters.maxProcessingFee = 500;
    
    component.resetFilters();
    
    expect(component.selectedFilters.minMatchScore).toBe(70);
    expect(component.selectedFilters.maxInterestRate).toBe(15);
    expect(component.selectedFilters.maxProcessingFee).toBe(1000);
  });

  it('should get correct match score class', () => {
    expect(component.getMatchScoreClass(95)).toBe('score-excellent');
    expect(component.getMatchScoreClass(85)).toBe('score-very-good');
    expect(component.getMatchScoreClass(75)).toBe('score-good');
    expect(component.getMatchScoreClass(65)).toBe('score-fair');
    expect(component.getMatchScoreClass(55)).toBe('score-poor');
  });

  it('should get correct eligibility class', () => {
    expect(component.getEligibilityClass('ELIGIBLE')).toBe('eligible');
    expect(component.getEligibilityClass('PARTIALLY_ELIGIBLE')).toBe('partially-eligible');
    expect(component.getEligibilityClass('NOT_ELIGIBLE')).toBe('not-eligible');
  });

  it('should apply to lender', () => {
    const lender = mockLenders[0];
    spyOn(console, 'log');
    
    component.applyToLender(lender);
    
    expect(console.log).toHaveBeenCalledWith('Applying to lender:', lender);
  });

  it('should view lender details', () => {
    const lender = mockLenders[0];
    spyOn(console, 'log');
    
    component.viewLenderDetails(lender);
    
    expect(console.log).toHaveBeenCalledWith('Viewing lender details:', lender);
  });

  it('should get eligible count correctly', () => {
    fixture.detectChanges();
    
    const eligibleCount = component.getEligibleCount();
    expect(eligibleCount).toBeGreaterThanOrEqual(0);
    expect(eligibleCount).toBeLessThanOrEqual(component.lenderMatches.length);
  });

  it('should handle loading state correctly', () => {
    expect(component.isLoading).toBe(false);
    
    component.loadLenderMatches();
    
    expect(component.isLoading).toBe(true);
  });

  it('should handle errors gracefully', () => {
    mockApiService.getLenders.and.returnValue(of([]));
    
    fixture.detectChanges();
    
    expect(component.lenderMatches.length).toBe(0);
  });

  it('should show loading state while fetching data', () => {
    expect(component.isLoading).toBe(false);
    
    component.loadLenderMatches();
    
    expect(component.isLoading).toBe(true);
  });

  it('should filter lenders based on selected criteria', () => {
    fixture.detectChanges();
    
    // Test with high match score filter
    component.selectedFilters.minMatchScore = 90;
    component.applyFilters();
    
    const highScoreMatches = component.lenderMatches.filter(m => m.matchScore >= 90);
    expect(component.lenderMatches.length).toBe(highScoreMatches.length);
  });

  it('should calculate interest rate correctly', () => {
    fixture.detectChanges();
    
    const match = component.lenderMatches[0];
    expect(match.interestRate).toBeGreaterThan(0);
    expect(match.interestRate).toBeLessThanOrEqual(100);
  });

  it('should calculate processing fee correctly', () => {
    fixture.detectChanges();
    
    const match = component.lenderMatches[0];
    expect(match.processingFee).toBeGreaterThanOrEqual(0);
  });

  it('should calculate max loan amount correctly', () => {
    fixture.detectChanges();
    
    const match = component.lenderMatches[0];
    expect(match.maxLoanAmount).toBeGreaterThan(0);
  });
});
