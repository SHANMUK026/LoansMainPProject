import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { User, CustomerProfile, LenderProfile, LenderRule, LoanApplication, EligibilityResult, LoginRequest, RegisterRequest, AuthResponse } from '../models/roles.model';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private baseUrl = 'assets/data';

  constructor(private http: HttpClient) {}

  // Simulate API latency
  private simulateDelay<T>(data: T): Observable<T> {
    return of(data).pipe(delay(Math.random() * 100 + 200)); // 200-300ms delay
  }

  // Auth endpoints
  login(request: LoginRequest): Observable<AuthResponse> {
    // Mock login - accept any password for demo users
    const users = this.getMockUsers();
    const user = users.find(u => u.username === request.username);
    
    if (user) {
      return this.simulateDelay({
        id: user.id,
        username: user.username,
        roles: user.roles,
        token: 'mock-jwt-token-' + user.id
      });
    }
    
    throw new Error('Invalid credentials');
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      // Simulate API delay
      setTimeout(() => {
        // Check if username already exists
        const existingUser = this.getMockUsers().find(u => u.username === request.username);
        if (existingUser) {
          observer.error({
            success: false,
            message: 'Username already exists'
          });
          return;
        }

        // Create new user (default role is BORROWER)
        const newUser: User = {
          id: this.getMockUsers().length + 1,
          username: request.username,
          email: request.email || '',
          roles: ['BORROWER'],
          token: `token-${Date.now()}`
        };

        this.getMockUsers().push(newUser);

        observer.next({
          id: newUser.id,
          username: newUser.username,
          roles: newUser.roles,
          token: newUser.token || `token-${Date.now()}`
        });
        observer.complete();
      }, 1000);
    });
  }

  // Customer endpoints
  getCustomerProfile(): Observable<CustomerProfile> {
    const customers = this.getMockCustomers();
    const customer = customers[0]; // For demo, return first customer
    return this.simulateDelay(customer);
  }

  updateCustomerProfile(profile: Partial<CustomerProfile>): Observable<CustomerProfile> {
    const customers = this.getMockCustomers();
    const updated = { ...customers[0], ...profile };
    return this.simulateDelay(updated);
  }

  getCustomerApplications(): Observable<LoanApplication[]> {
    const applications = this.getMockApplications();
    return this.simulateDelay(applications);
  }

  createLoanApplication(application: { requestedAmount: number; purpose?: string }): Observable<LoanApplication> {
    const applications = this.getMockApplications();
    const newId = Math.max(...applications.map(a => a.id)) + 1;
    const newApplication: LoanApplication = {
      id: newId,
      customerId: 2, // Demo customer ID
      borrowerId: 2,
      lenderId: 1,
      requestedAmount: application.requestedAmount,
      loanAmount: application.requestedAmount,
      loanPurpose: application.purpose || 'Personal loan',
      loanTerm: 36,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      eligibilityScore: 0,
      monthlyIncome: 75000,
      creditScore: 720,
      employmentStatus: 'EMPLOYED'
    };
    return this.simulateDelay(newApplication);
  }

  // Lender endpoints
  getLenderProfile(): Observable<LenderProfile> {
    const lenders = this.getMockLenders();
    const lender = lenders[0]; // For demo, return first lender
    return this.simulateDelay(lender);
  }

  updateLenderProfile(profile: Partial<LenderProfile>): Observable<LenderProfile> {
    const lenders = this.getMockLenders();
    const updated = { ...lenders[0], ...profile };
    return this.simulateDelay(updated);
  }

  getLenderRules(): Observable<LenderRule[]> {
    // Use JSON Server for real data storage
    return this.http.get<LenderRule[]>('http://localhost:3000/lenderRules');
  }

  createLenderRule(rule: Omit<LenderRule, 'id'>): Observable<LenderRule> {
    // Add lenderId if not provided (default to 1 for demo)
    const ruleWithLenderId = {
      ...rule,
      lenderId: rule.lenderId || 1
    };
    
    // Use JSON Server for real data storage
    return this.http.post<LenderRule>('http://localhost:3000/lenderRules', ruleWithLenderId);
  }

  updateLenderRule(id: number, rule: Partial<LenderRule>): Observable<LenderRule> {
    // Use JSON Server for real data storage
    return this.http.patch<LenderRule>(`http://localhost:3000/lenderRules/${id}`, rule);
  }

  deleteLenderRule(id: number): Observable<void> {
    // Use JSON Server for real data storage
    return this.http.delete<void>(`http://localhost:3000/lenderRules/${id}`);
  }

  // Loan application management
  updateLoanApplication(id: number, updates: Partial<LoanApplication>): Observable<LoanApplication> {
    const applications = this.getMockApplications();
    const index = applications.findIndex(app => app.id === id);
    
    if (index === -1) {
      throw new Error('Application not found');
    }
    
    const updatedApplication = {
      ...applications[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    applications[index] = updatedApplication;
    return this.simulateDelay(updatedApplication);
  }

  getLoanApplicationsByLender(lenderId: number): Observable<LoanApplication[]> {
    const applications = this.getMockApplications();
    const lenderApplications = applications.filter(app => app.lenderId === lenderId);
    return this.simulateDelay(lenderApplications);
  }

  // Eligibility endpoint
  checkEligibility(applicationId: number): Observable<EligibilityResult[]> {
    const applications = this.getMockApplications();
    const customers = this.getMockCustomers();
    const lenders = this.getMockLenders();
    const rules = this.getMockRules();

    const application = applications.find(a => a.id === applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const customer = customers[0]; // Demo customer
    const activeRules = rules.filter(r => r.isActive);

    const results: EligibilityResult[] = activeRules.map(rule => {
      const lender = lenders.find(l => l.id === rule.lenderId);
      if (!lender) return null;

      const eligible =
        customer.salary >= rule.minSalary &&
        customer.creditScore >= rule.minCreditScore &&
        customer.age >= rule.minAge &&
        customer.age <= rule.maxAge &&
        application.requestedAmount <= rule.maxLoanAmount;

      return {
        lenderId: lender.id,
        lenderName: lender.displayName,
        rule: {
          minSalary: rule.minSalary,
          maxLoanAmount: rule.maxLoanAmount,
          minCreditScore: rule.minCreditScore,
          minAge: rule.minAge,
          maxAge: rule.maxAge
        },
        eligible
      };
    }).filter(Boolean) as EligibilityResult[];

    return this.simulateDelay(results);
  }

  // Admin endpoints
  getUsers(): Observable<User[]> {
    const users = this.getMockUsers();
    return this.simulateDelay(users);
  }

  getLoanApplications(): Observable<LoanApplication[]> {
    // Mock implementation - return all applications
    const mockApplications: LoanApplication[] = [
      {
        id: 1,
        borrowerId: 1,
        lenderId: 1,
        loanAmount: 500000,
        loanPurpose: 'Home Renovation',
        loanTerm: 24,
        status: 'PENDING',
        appliedDate: new Date('2024-11-15'),
        updatedAt: '2024-11-15T10:00:00Z',
        eligibilityScore: 75,
        monthlyIncome: 45000,
        creditScore: 720,
        employmentStatus: 'EMPLOYED',
        monthlyEMI: 25000,
        comments: 'Application under review',
        decisionDate: undefined,
        decisionBy: undefined,
        customerId: 1,
        requestedAmount: 500000,
        createdAt: '2024-11-15T00:00:00Z'
      },
      {
        id: 2,
        borrowerId: 2,
        lenderId: 1,
        loanAmount: 300000,
        loanPurpose: 'Business Expansion',
        loanTerm: 36,
        status: 'APPROVED',
        appliedDate: new Date('2024-11-10'),
        updatedAt: '2024-11-12T14:30:00Z',
        eligibilityScore: 85,
        monthlyIncome: 60000,
        creditScore: 780,
        employmentStatus: 'EMPLOYED',
        monthlyEMI: 12000,
        comments: 'Application approved',
        decisionDate: '2024-11-12T14:30:00Z',
        decisionBy: 'Lender Manager',
        customerId: 2,
        requestedAmount: 300000,
        createdAt: '2024-11-10T00:00:00Z'
      }
    ];
    
    return of(mockApplications);
  }

  // Mock data getters
  private getMockUsers(): User[] {
    return [
      { 
        id: 1, 
        username: 'admin1', 
        roles: ['ADMIN'],
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@lendflow.com',
        phone: '+1-555-0001'
      },
      { 
        id: 2, 
        username: 'cust1', 
        roles: ['BORROWER'],
        role: 'BORROWER',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0002'
      },
      { 
        id: 3, 
        username: 'lender1', 
        roles: ['LENDER'],
        role: 'LENDER',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@abcfinance.com',
        phone: '+1-555-0003',
        company: 'ABC Finance'
      }
    ];
  }

  private getMockCustomers(): CustomerProfile[] {
    return [
      { id: 1, userId: 2, fullName: 'John Doe', age: 35, salary: 75000, creditScore: 720 }
    ];
  }

  private getMockLenders(): LenderProfile[] {
    return [
      { id: 1, userId: 3, displayName: 'ABC Finance' }
    ];
  }

  private getMockRules(): LenderRule[] {
    return [
      { id: 1, lenderId: 1, minSalary: 50000, minLoanAmount: 10000, maxLoanAmount: 500000, minCreditScore: 650, minAge: 21, maxAge: 65, employmentTypes: ['EMPLOYED', 'SELF_EMPLOYED'], isActive: true },
      { id: 2, lenderId: 1, minSalary: 30000, minLoanAmount: 5000, maxLoanAmount: 200000, minCreditScore: 600, minAge: 18, maxAge: 70, employmentTypes: ['EMPLOYED', 'SELF_EMPLOYED', 'STUDENT'], isActive: true }
    ];
  }

  private getMockApplications(): LoanApplication[] {
    return [
      {
        id: 1,
        customerId: 2,
        borrowerId: 2,
        lenderId: 1,
        requestedAmount: 250000,
        loanAmount: 250000,
        loanPurpose: 'Home renovation',
        loanTerm: 60,
        status: 'PENDING',
        createdAt: '2024-01-15T10:30:00Z',
        eligibilityScore: 75,
        monthlyIncome: 75000,
        creditScore: 720,
        employmentStatus: 'EMPLOYED',
        monthlyEMI: 5200,
        comments: 'Application under review'
      },
      {
        id: 2,
        customerId: 2,
        borrowerId: 2,
        lenderId: 1,
        requestedAmount: 150000,
        loanAmount: 150000,
        loanPurpose: 'Business expansion',
        loanTerm: 36,
        status: 'APPROVED',
        createdAt: '2024-01-10T14:20:00Z',
        updatedAt: '2024-01-12T09:15:00Z',
        eligibilityScore: 85,
        monthlyIncome: 75000,
        creditScore: 720,
        employmentStatus: 'EMPLOYED',
        monthlyEMI: 4800,
        decisionDate: '2024-01-12T09:15:00Z',
        decisionBy: 'Lender Manager'
      }
    ];
  }
}
