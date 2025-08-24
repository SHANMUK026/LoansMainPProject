import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
  selector: 'app-borrower-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './borrower-profile.component.html',
  styleUrl: './borrower-profile.component.css'
})
export class BorrowerProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;
  isSaving = false;
  showSuccessMessage = false;

  constructor(
    private authService: AuthService,
    private mockApi: MockApiService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      company: ['', [Validators.required]],
      monthlyIncome: ['', [Validators.required, Validators.min(10000)]],
      creditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]],
      employmentStatus: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.authService.hasRole('BORROWER')) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    // Load user profile data
    setTimeout(() => {
      if (this.currentUser) {
        this.profileForm.patchValue({
          firstName: this.currentUser.firstName || '',
          lastName: this.currentUser.lastName || '',
          email: this.currentUser.email || '',
          phone: this.currentUser.phone || '',
          company: this.currentUser.company || '',
          monthlyIncome: this.currentUser?.monthlyIncome || '',
          creditScore: this.currentUser?.creditScore || '',
          employmentStatus: this.currentUser?.employmentStatus || '',
          dateOfBirth: this.currentUser?.dateOfBirth || '',
          address: this.currentUser?.address || '',
          city: this.currentUser?.city || '',
          state: this.currentUser?.state || '',
          pincode: this.currentUser?.pincode || ''
        });
      }
      this.isLoading = false;
    }, 1000);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile(); // Reset form
    }
  }

  async saveProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user profile
      if (this.currentUser) {
        Object.assign(this.currentUser, this.profileForm.value);
        // Update user profile - in a real app, this would call an API
        console.log('Profile updated:', this.currentUser);
      }
      
      this.isEditing = false;
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      this.isSaving = false;
    }
  }

  markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack() {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getFormControl(name: string) {
    return this.profileForm.get(name);
  }

  isFieldInvalid(name: string): boolean {
    const control = this.getFormControl(name);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(name: string): string {
    const control = this.getFormControl(name);
    if (control && control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
      if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}`;
      if (control.errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }

  getCreditScoreClass(): string {
    const score = this.currentUser?.creditScore || 0;
    if (!score) return '';
    if (score >= 750) return 'excellent';
    if (score >= 650) return 'good';
    return 'fair';
  }
}
