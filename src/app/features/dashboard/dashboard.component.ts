import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../core/models/roles.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  getRoleDisplayName(role: string | undefined): string {
    if (!role) return 'User';
    
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'LENDER':
        return 'Lender';
      case 'BORROWER':
        return 'Borrower';
      default:
        return 'User';
    }
  }

  getTilesGridClass(): string {
    if (this.hasRole('ADMIN')) {
      return 'grid grid--3 gap--lg';
    } else if (this.hasRole('LENDER')) {
      return 'grid grid--3 gap--lg';
    } else if (this.hasRole('BORROWER')) {
      return 'grid grid--3 gap--lg';
    }
    return 'grid grid--1 gap--lg';
  }

  logout() {
    this.authService.logout();
  }
}
