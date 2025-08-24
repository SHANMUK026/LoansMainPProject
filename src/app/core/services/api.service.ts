import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id?: number;
  username: string;
  password?: string;
  email: string;
  role: 'ADMIN' | 'LENDER' | 'BORROWER';
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
  lendingLicense?: string;
  dateOfBirth?: string;
  address?: string;
  monthlyIncome?: number;
  creditScore?: number;
  employmentStatus?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface Lender {
  id?: number;
  userId: number;
  companyName: string;
  lendingLicense: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  minCreditScore: number;
  minMonthlyIncome: number;
  minAge: number;
  maxAge: number;
  interestRateRange: {
    min: number;
    max: number;
  };
  loanTerms: number[];
  specializations: string[];
  isActive: boolean;
  createdAt?: string;
}

export interface LoanApplication {
  id?: number;
  borrowerId: number;
  lenderId: number;
  loanAmount: number;
  loanPurpose: string;
  loanTerm: number;
  monthlyIncome: number;
  creditScore: number;
  employmentStatus: string;
  documents: {
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  eligibilityScore?: number;
  monthlyEMI?: number;
  totalInterest?: number;
  totalAmount?: number;
  appliedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EligibilityRule {
  id?: number;
  lenderId: number;
  ruleName: string;
  minLoanAmount: number;
  maxLoanAmount: number;
  minCreditScore: number;
  minMonthlyIncome: number;
  minAge: number;
  maxAge: number;
  employmentTypes: string[];
  interestRate: number;
  processingFee: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Notification {
  id?: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3001';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // Authentication
  login(username: string, password: string): Observable<User> {
    return this.http.get<User[]>(`${this.baseUrl}/users?username=${username}`).pipe(
      map(users => {
        const user = users[0];
        if (user && user.password === password) {
          // Remove password before storing
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          this.currentUserSubject.next(userWithoutPassword);
          return userWithoutPassword;
        }
        throw new Error('Invalid credentials');
      })
    );
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Lenders
  getLenders(): Observable<Lender[]> {
    return this.http.get<Lender[]>(`${this.baseUrl}/lenders`);
  }

  getLenderById(id: number): Observable<Lender> {
    return this.http.get<Lender>(`${this.baseUrl}/lenders/${id}`);
  }

  createLender(lender: Lender): Observable<Lender> {
    return this.http.post<Lender>(`${this.baseUrl}/lenders`, lender);
  }

  updateLender(id: number, lender: Partial<Lender>): Observable<Lender> {
    return this.http.patch<Lender>(`${this.baseUrl}/lenders/${id}`, lender);
  }

  // Loan Applications
  getLoanApplications(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.baseUrl}/loanApplications`);
  }

  getLoanApplicationById(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.baseUrl}/loanApplications/${id}`);
  }

  getLoanApplicationsByBorrower(borrowerId: number): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.baseUrl}/loanApplications?borrowerId=${borrowerId}`);
  }

  getLoanApplicationsByLender(lenderId: number): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.baseUrl}/loanApplications?lenderId=${lenderId}`);
  }



  createLoanApplication(application: LoanApplication): Observable<LoanApplication> {
    return this.http.post<LoanApplication>(`${this.baseUrl}/loanApplications`, application);
  }

  updateLoanApplication(id: number, application: Partial<LoanApplication>): Observable<LoanApplication> {
    return this.http.patch<LoanApplication>(`${this.baseUrl}/loanApplications/${id}`, application);
  }

  // Eligibility Rules
  getEligibilityRules(): Observable<EligibilityRule[]> {
    return this.http.get<EligibilityRule[]>(`${this.baseUrl}/eligibilityRules`);
  }

  getEligibilityRulesByLender(lenderId: number): Observable<EligibilityRule[]> {
    return this.http.get<EligibilityRule[]>(`${this.baseUrl}/eligibilityRules?lenderId=${lenderId}`);
  }

  createEligibilityRule(rule: EligibilityRule): Observable<EligibilityRule> {
    return this.http.post<EligibilityRule>(`${this.baseUrl}/eligibilityRules`, rule);
  }

  updateEligibilityRule(id: number, rule: Partial<EligibilityRule>): Observable<EligibilityRule> {
    return this.http.patch<EligibilityRule>(`${this.baseUrl}/eligibilityRules/${id}`, rule);
  }

  deleteEligibilityRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/eligibilityRules/${id}`);
  }

  // Notifications
  getNotificationsByUser(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications?userId=${userId}`);
  }

  markNotificationAsRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.baseUrl}/notifications/${id}`, { isRead: true });
  }

  createNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(`${this.baseUrl}/notifications`, notification);
  }

  // Loan Calculator
  getLoanCalculatorDefaults(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/loanCalculator`);
  }

  // Check Eligibility
  checkEligibility(borrowerData: any, lenderRules: EligibilityRule[]): any {
    let bestMatch = null;
    let highestScore = 0;

    for (const rule of lenderRules) {
      let score = 0;
      let isEligible = true;

      // Check basic requirements
      if (borrowerData.monthlyIncome < rule.minMonthlyIncome) {
        isEligible = false;
      }
      if (borrowerData.creditScore < rule.minCreditScore) {
        isEligible = false;
      }
      if (borrowerData.age < rule.minAge || borrowerData.age > rule.maxAge) {
        isEligible = false;
      }
      if (borrowerData.loanAmount < rule.minLoanAmount || borrowerData.loanAmount > rule.maxLoanAmount) {
        isEligible = false;
      }

      if (isEligible) {
        // Calculate score based on how well they match
        score += 20; // Base score for meeting requirements
        
        // Bonus for exceeding minimums
        if (borrowerData.creditScore >= rule.minCreditScore + 50) score += 15;
        if (borrowerData.monthlyIncome >= rule.minMonthlyIncome * 1.5) score += 15;
        if (borrowerData.loanAmount <= rule.maxLoanAmount * 0.8) score += 10;

        if (score > highestScore) {
          highestScore = score;
          bestMatch = rule;
        }
      }
    }

    return {
      isEligible: bestMatch !== null,
      bestMatch,
      score: highestScore
    };
  }

}
