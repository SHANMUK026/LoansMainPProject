import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface CalculationResults {
  loanAmount: number;
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
  processingFee: number;
}

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './loan-calculator.component.html',
  styleUrls: ['./loan-calculator.component.css']
})
export class LoanCalculatorComponent implements OnInit {
  calculatorForm: FormGroup;
  calculationResults: CalculationResults | null = null;
  isCalculating = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.calculatorForm = this.fb.group({
      loanAmount: ['', [Validators.required, Validators.min(1000)]],
      interestRate: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      tenureYears: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      processingFee: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Initialize with default values
    this.calculatorForm.patchValue({
      loanAmount: 100000,
      interestRate: 8.5,
      tenureYears: 5,
      processingFee: 500
    });
  }

  calculateLoan(): void {
    if (this.calculatorForm.valid) {
      this.isCalculating = true;
      
      // Simulate calculation delay
      setTimeout(() => {
        const formValue = this.calculatorForm.value;
        const principal = formValue.loanAmount;
        const rate = formValue.interestRate / 100 / 12; // Monthly rate
        const time = formValue.tenureYears * 12; // Total months
        
        // Calculate EMI using formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
        const emi = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
        const totalAmount = emi * time;
        const totalInterest = totalAmount - principal;
        
        this.calculationResults = {
          loanAmount: principal,
          monthlyEMI: Math.round(emi),
          totalInterest: Math.round(totalInterest),
          totalAmount: Math.round(totalAmount),
          processingFee: formValue.processingFee
        };
        
        this.isCalculating = false;
      }, 1000);
    }
  }

  getEligibilityClass(): string {
    if (!this.calculationResults) return '';
    
    const emiToIncomeRatio = this.calculationResults.monthlyEMI / 50000; // Assuming 50k monthly income
    
    if (emiToIncomeRatio <= 0.3) return 'status-eligible';
    if (emiToIncomeRatio <= 0.5) return 'status-pending';
    return 'status-ineligible';
  }

  getEligibilityTitle(): string {
    if (!this.calculationResults) return '';
    
    const emiToIncomeRatio = this.calculationResults.monthlyEMI / 50000;
    
    if (emiToIncomeRatio <= 0.3) return 'Excellent Eligibility';
    if (emiToIncomeRatio <= 0.5) return 'Good Eligibility';
    return 'Limited Eligibility';
  }

  getEligibilityDescription(): string {
    if (!this.calculationResults) return '';
    
    const emiToIncomeRatio = this.calculationResults.monthlyEMI / 50000;
    
    if (emiToIncomeRatio <= 0.3) return 'Your loan application has a very high chance of approval';
    if (emiToIncomeRatio <= 0.5) return 'Your loan application has a good chance of approval';
    return 'Consider reducing loan amount or increasing tenure for better approval chances';
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
