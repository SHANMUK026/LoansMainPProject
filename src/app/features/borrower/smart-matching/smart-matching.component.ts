import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Lender, EligibilityRule } from '../../../core/services/api.service';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

export interface LenderMatch {
  lender: Lender;
  matchScore: number;
  matchReasons: string[];
  interestRate: number;
  processingFee: number;
  maxLoanAmount: number;
  eligibilityStatus: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
}

@Component({
  selector: 'app-smart-matching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smart-matching.component.html',
  styleUrl: './smart-matching.component.css'
})
export class SmartMatchingComponent implements OnInit {
  currentUser: User | null = null;
  lenderMatches: LenderMatch[] = [];
  isLoading = false;
  selectedFilters = {
    minMatchScore: 70,
    maxInterestRate: 15,
    maxProcessingFee: 1000
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser || this.currentUser.role !== 'BORROWER') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadLenderMatches();
  }

  loadLenderMatches(): void {
    this.isLoading = true;
    
    // Simulate API call to get lenders and calculate matches
    this.apiService.getLenders().subscribe({
      next: (lenders) => {
        this.lenderMatches = lenders.map(lender => this.calculateMatchScore(lender));
        this.sortByMatchScore();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading lenders:', error);
        this.isLoading = false;
      }
    });
  }

  calculateMatchScore(lender: Lender): LenderMatch {
    const user = this.currentUser!;
    let score = 0;
    const reasons: string[] = [];

    // Credit Score Match (30 points)
    const mockCreditScore = 720;
    if (mockCreditScore >= lender.minCreditScore) {
      score += 30;
      reasons.push('✅ Credit score meets requirements');
    } else {
      reasons.push(`⚠️ Credit score ${mockCreditScore} below required ${lender.minCreditScore}`);
    }

    // Monthly Income Match (25 points)
    const mockMonthlyIncome = 75000;
    if (mockMonthlyIncome >= lender.minMonthlyIncome) {
      score += 25;
      reasons.push('✅ Income meets requirements');
    } else {
      reasons.push(`⚠️ Income $${mockMonthlyIncome} below required $${lender.minMonthlyIncome}`);
    }

    // Age Match (15 points)
    const userAge = 35; // Mock age
    if (userAge >= lender.minAge && userAge <= lender.maxAge) {
      score += 15;
      reasons.push('✅ Age within range');
    } else {
      reasons.push(`⚠️ Age ${userAge} outside range ${lender.minAge}-${lender.maxAge}`);
    }

    // Loan Amount Range (20 points)
    const maxLoanForUser = mockMonthlyIncome * 12 * 0.4;
    if (maxLoanForUser >= lender.minLoanAmount && maxLoanForUser <= lender.maxLoanAmount) {
      score += 20;
      reasons.push('✅ Loan amount within range');
    } else {
      reasons.push(`⚠️ Max loan $${maxLoanForUser} outside range $${lender.minLoanAmount}-$${lender.maxLoanAmount}`);
    }

    // Specialization Bonus (10 points)
    if (lender.specializations.includes('Personal Loans')) {
      score += 10;
      reasons.push('🎯 Specializes in personal loans');
    }

    // Determine eligibility status
    let eligibilityStatus: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
    if (score >= 80) eligibilityStatus = 'ELIGIBLE';
    else if (score >= 60) eligibilityStatus = 'PARTIALLY_ELIGIBLE';
    else eligibilityStatus = 'NOT_ELIGIBLE';

    return {
      lender,
      matchScore: Math.min(100, score),
      matchReasons: reasons,
      interestRate: lender.interestRateRange.min,
      processingFee: 500, // Default processing fee
      maxLoanAmount: Math.min(lender.maxLoanAmount, maxLoanForUser),
      eligibilityStatus
    };
  }

  calculateAge(dateOfBirth: string | undefined): number {
    if (!dateOfBirth) return 25; // Default age
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  sortByMatchScore(): void {
    this.lenderMatches.sort((a, b) => b.matchScore - a.matchScore);
  }

  applyFilters(): void {
    this.lenderMatches = this.lenderMatches.filter(match => 
      match.matchScore >= this.selectedFilters.minMatchScore &&
      match.interestRate <= this.selectedFilters.maxInterestRate &&
      match.processingFee <= this.selectedFilters.maxProcessingFee
    );
  }

  resetFilters(): void {
    this.selectedFilters = {
      minMatchScore: 70,
      maxInterestRate: 15,
      maxProcessingFee: 1000
    };
    this.loadLenderMatches();
  }

  getMatchScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 60) return 'score-fair';
    return 'score-poor';
  }

  getEligibleCount(): number {
    return this.lenderMatches.filter(m => m.eligibilityStatus === 'ELIGIBLE').length;
  }

  getEligibilityClass(status: string): string {
    switch (status) {
      case 'ELIGIBLE': return 'status-eligible';
      case 'PARTIALLY_ELIGIBLE': return 'status-partial';
      case 'NOT_ELIGIBLE': return 'status-not-eligible';
      default: return 'status-unknown';
    }
  }

  applyToLender(lender: Lender): void {
    this.router.navigate(['/borrower/apply-loan'], { 
      queryParams: { lenderId: lender.id } 
    });
  }

  viewLenderDetails(lender: Lender): void {
    // TODO: Implement lender detail view
    console.log('View lender details:', lender);
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
