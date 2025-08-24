import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser || this.currentUser.role !== 'ADMIN') {
      this.router.navigate(['/login']);
    }
  }

  viewAnalytics() {
    this.router.navigate(['/admin/analytics']);
  }

  manageUsers() {
    this.router.navigate(['/admin/users']);
  }

  manageLenders() {
    this.router.navigate(['/admin/lenders']);
  }

  reviewApplications() {
    this.router.navigate(['/admin/applications']);
  }

  systemSettings() {
    this.router.navigate(['/admin/settings']);
  }

  generateReports() {
    this.router.navigate(['/admin/reports']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
