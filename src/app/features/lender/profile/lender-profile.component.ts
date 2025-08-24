import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { LenderProfile } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-lender-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lender-profile.component.html',
  styleUrls: ['./lender-profile.component.css']
})
export class LenderProfileComponent implements OnInit {
  profile: LenderProfile | null = null;
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
      displayName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.mockApi.getLenderProfile().subscribe({
      next: (profile: LenderProfile) => {
        this.profileForm.patchValue({
          displayName: profile.displayName
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

      this.mockApi.updateLenderProfile(this.profileForm.value).subscribe({
        next: (updatedProfile: LenderProfile) => {
          this.successMessage = 'Profile updated successfully!';
          this.isSaving = false;
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
    this.router.navigate(['/lender/dashboard']);
  }

  get displayName() {
    return this.profileForm.get('displayName');
  }

  goBack(): void {
    this.router.navigate(['/lender/dashboard']);
  }

  logout(): void {
    console.log('Logout clicked!');
    this.authService.logout();
    console.log('User logged out, navigating to login...');
    this.router.navigate(['/login']);
  }
}
