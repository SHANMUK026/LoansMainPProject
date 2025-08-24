import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private mockApi: MockApiService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.mockApi.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'badge--error';
      case 'LENDER':
        return 'badge--warning';
      case 'CUSTOMER':
        return 'badge--info';
      default:
        return 'badge--pending';
    }
  }

  formatRoles(roles: string[]): string {
    return roles.join(', ');
  }

  // Enhanced User Management Actions
  approveUser(user: User): void {
    // Mock approval functionality
    console.log('Approving user:', user.username);
    // In real app, this would call an API
  }

  suspendUser(user: User): void {
    // Mock suspension functionality
    console.log('Suspending user:', user.username);
    // In real app, this would call an API
  }

  activateUser(user: User): void {
    // Mock activation functionality
    console.log('Activating user:', user.username);
    // In real app, this would call an API
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to permanently delete user "${user.username}"? This action cannot be undone.`)) {
      // Mock deletion functionality
      console.log('Deleting user:', user.username);
      // In real app, this would call an API
      // Remove from local array for demo
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }

  resetUserPassword(user: User): void {
    if (confirm(`Reset password for user "${user.username}"?`)) {
      // Mock password reset functionality
      console.log('Resetting password for user:', user.username);
      // In real app, this would call an API
    }
  }

  changeUserRole(user: User, newRole: string): void {
    if (confirm(`Change role of "${user.username}" from ${user.role} to ${newRole}?`)) {
      // Mock role change functionality
      console.log('Changing role for user:', user.username, 'to', newRole);
      // In real app, this would call an API
      user.role = newRole;
    }
  }

  viewUserDetails(user: User): void {
    // Mock view details functionality
    console.log('Viewing user details:', user.username);
    // In real app, this would navigate to a details page
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
