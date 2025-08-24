import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { CustomerProfile } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  profile: CustomerProfile | null = null;
  isLoading = false;
  isEditing = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      salary: ['', [Validators.required, Validators.min(0)]],
      creditScore: ['', [Validators.required, Validators.min(300), Validators.max(850)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.mockApi.getCustomerProfile().subscribe({
      next: (profile: CustomerProfile) => {
        this.profileForm.patchValue({
          fullName: profile.fullName,
          age: profile.age,
          salary: profile.salary,
          creditScore: profile.creditScore
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load profile: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      this.successMessage = '';
      this.errorMessage = '';

      this.mockApi.updateCustomerProfile(this.profileForm.value).subscribe({
        next: (updatedProfile: CustomerProfile) => {
          this.successMessage = 'Profile updated successfully!';
          this.isSaving = false;
          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update profile: ' + error.message;
          this.isSaving = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  get fullName() {
    return this.profileForm.get('fullName');
  }

  get age() {
    return this.profileForm.get('age');
  }

  get salary() {
    return this.profileForm.get('salary');
  }

  get creditScore() {
    return this.profileForm.get('creditScore');
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
