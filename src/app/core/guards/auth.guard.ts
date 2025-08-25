import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Checking authentication...');
  console.log('AuthGuard: isAuthenticated =', authService.isAuthenticated);
  console.log('AuthGuard: currentUser =', authService.currentUser);
  console.log('AuthGuard: token =', authService.authToken);

  if (authService.isAuthenticated) {
    console.log('AuthGuard: User is authenticated, allowing access');
    return true;
  }

  console.log('AuthGuard: User is not authenticated, redirecting to login');
  router.navigate(['/login']);
  return false;
};

// Guard for public routes (landing page, login, register)
export const publicGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If not authenticated, allow access to public routes
  if (!authService.isAuthenticated) {
    return true;
  }

  // If authenticated, redirect to appropriate dashboard
  const currentUser = authService.currentUser;
  if (currentUser) {
    switch (currentUser.role) {
      case 'ADMIN':
        router.navigate(['/admin/dashboard']);
        break;
      case 'LENDER':
        router.navigate(['/lender/dashboard']);
        break;
      case 'BORROWER':
        router.navigate(['/borrower/dashboard']);
        break;
      default:
        router.navigate(['/dashboard']);
    }
  }
  
  return false;
};
