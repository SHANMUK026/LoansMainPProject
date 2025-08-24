export type Role = 'ADMIN' | 'LENDER' | 'BORROWER';

export interface User {
  id: number;
  username: string;
  email?: string;
  roles: Role[];
  token?: string;
  role?: string; // For backward compatibility
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  creditScore?: number;
  monthlyIncome?: number;
  employmentStatus?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface CustomerProfile {
  id: number;
  userId: number;
  fullName: string;
  age: number;
  salary: number;
  creditScore: number;
}

export interface LenderProfile {
  id: number;
  userId: number;
  displayName: string;
}

export interface LenderRule {
  id: number;
  lenderId: number;
  minSalary: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minCreditScore: number;
  minAge: number;
  maxAge: number;
  employmentTypes: string[];
  isActive: boolean;
}

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LoanApplication {
  id: number;
  customerId: number;
  borrowerId: number; // For backward compatibility
  lenderId: number;
  requestedAmount: number;
  loanAmount: number; // Final approved amount
  loanPurpose: string;
  loanTerm: number; // in months
  status: ApplicationStatus;
  createdAt: string; // ISO
  appliedDate?: Date; // For backward compatibility
  updatedAt?: string; // ISO
  eligibilityScore?: number; // 0-100 score
  monthlyIncome?: number;
  creditScore?: number;
  employmentStatus?: string;
  monthlyEMI?: number;
  comments?: string;
  decisionDate?: string;
  decisionBy?: string; // lender name who made the decision
}

export interface EligibilityResult {
  lenderId: number;
  lenderName: string;
  rule: {
    minSalary: number;
    maxLoanAmount: number;
    minCreditScore: number;
    minAge: number;
    maxAge: number;
  };
  eligible: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  roles: Role[];
  token: string;
}
