import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css']
})
export class AdminSettingsComponent implements OnInit {
  currentUser: any = null;
  systemSettings = {
    maxLoanAmount: 10000000,
    minCreditScore: 300,
    maxLoanTerm: 60,
    autoApprovalThreshold: 80,
    notificationEnabled: true,
    maintenanceMode: false
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
  }

  updateSetting(setting: string, value: any): void {
    (this.systemSettings as any)[setting] = value;
    console.log(`Updated ${setting} to ${value}`);
    // In real app, this would call an API
  }

  onInputChange(setting: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSetting(setting, target.value);
  }

  onCheckboxChange(setting: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateSetting(setting, target.checked);
  }

  saveSettings(): void {
    console.log('Saving system settings:', this.systemSettings);
    // In real app, this would call an API
  }

  resetSettings(): void {
    this.systemSettings = {
      maxLoanAmount: 10000000,
      minCreditScore: 300,
      maxLoanTerm: 60,
      autoApprovalThreshold: 80,
      notificationEnabled: true,
      maintenanceMode: false
    };
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
