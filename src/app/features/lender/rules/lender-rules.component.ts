import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LenderRule } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-lender-rules',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lender-rules.component.html',
  styleUrls: ['./lender-rules.component.css']
})
export class LenderRulesComponent implements OnInit {
  rules: LenderRule[] = [];
  isLoading = false;
  isAdding = false;
  isEditing = false;
  isSaving = false;
  editingRuleId: number | null = null;
  errorMessage = '';
  successMessage = '';

  ruleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {
    this.ruleForm = this.fb.group({
      minSalary: ['', [Validators.required, Validators.min(0)]],
      maxLoanAmount: ['', [Validators.required, Validators.min(1000)]],
      minCreditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]],
      minAge: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      maxAge: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.isLoading = true;
    this.mockApi.getLenderRules().subscribe({
      next: (rules: LenderRule[]) => {
        this.rules = rules;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load rules: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  addRule(): void {
    this.isAdding = true;
    this.isEditing = false;
    this.editingRuleId = null;
    this.ruleForm.reset({ isActive: true });
  }

  editRule(rule: LenderRule): void {
    this.isEditing = true;
    this.isAdding = false;
    this.editingRuleId = rule.id;
    this.ruleForm.patchValue({
      minSalary: rule.minSalary,
      maxLoanAmount: rule.maxLoanAmount,
      minCreditScore: rule.minCreditScore,
      minAge: rule.minAge,
      maxAge: rule.maxAge,
      isActive: rule.isActive
    });
  }

  cancelEdit(): void {
    this.isAdding = false;
    this.isEditing = false;
    this.editingRuleId = null;
    this.ruleForm.reset();
  }

  onSubmit(): void {
    console.log('Form submitted, valid:', this.ruleForm.valid);
    console.log('Form values:', this.ruleForm.value);
    console.log('Form errors:', this.ruleForm.errors);
    
    if (this.ruleForm.valid) {
      this.isSaving = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const formData = this.ruleForm.value;
      console.log('Processing form data:', formData);
      
      if (formData.minAge >= formData.maxAge) {
        this.errorMessage = 'Minimum age must be less than maximum age';
        this.isSaving = false;
        return;
      }

      if (this.isAdding) {
        console.log('Creating new rule...');
        this.createRule(formData);
      } else if (this.isEditing && this.editingRuleId) {
        console.log('Updating rule:', this.editingRuleId);
        this.updateRule(this.editingRuleId, formData);
      }
    } else {
      console.log('Form is invalid, showing errors');
      this.ruleForm.markAllAsTouched();
    }
  }

  createRule(ruleData: any): void {
    console.log('Calling createLenderRule with data:', ruleData);
    
    this.mockApi.createLenderRule(ruleData).subscribe({
      next: (newRule: LenderRule) => {
        console.log('Rule created successfully:', newRule);
        this.rules.push(newRule);
        this.successMessage = 'Rule created successfully!';
        this.isSaving = false;
        this.cancelEdit();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Rule creation error:', error);
        console.error('Error details:', {
          message: error.message,
          error: error.error,
          status: error.status,
          statusText: error.statusText
        });
        this.errorMessage = 'Failed to create rule: ' + (error.error?.message || error.message || 'Unknown error');
        this.isSaving = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  updateRule(ruleId: number, ruleData: any): void {
    this.mockApi.updateLenderRule(ruleId, ruleData).subscribe({
      next: (updatedRule: LenderRule) => {
        const index = this.rules.findIndex(r => r.id === ruleId);
        if (index !== -1) {
          this.rules[index] = updatedRule;
        }
        this.successMessage = 'Rule updated successfully!';
        this.isSaving = false;
        this.cancelEdit();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to update rule: ' + error.message;
        this.isSaving = false;
      }
    });
  }

  deleteRule(ruleId: number): void {
    if (confirm('Are you sure you want to delete this rule?')) {
      this.mockApi.deleteLenderRule(ruleId).subscribe({
        next: () => {
          this.rules = this.rules.filter(r => r.id !== ruleId);
          this.successMessage = 'Rule deleted successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete rule: ' + error.message;
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  goBack(): void {
    this.router.navigate(['/lender/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
