import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Checking authentication...');
    console.log('AuthGuard: isAuthenticated =', this.authService.isAuthenticated);
    console.log('AuthGuard: currentUser =', this.authService.currentUser);
    console.log('AuthGuard: token =', this.authService.authToken);

    if (this.authService.isAuthenticated) {
      console.log('AuthGuard: User is authenticated, allowing access');
      return true;
    }

    console.log('AuthGuard: User is not authenticated, redirecting to login');
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('PublicGuard: Checking public route access...');
    console.log('PublicGuard: isAuthenticated =', this.authService.isAuthenticated);

    // If not authenticated, allow access to public routes
    if (!this.authService.isAuthenticated) {
      console.log('PublicGuard: User not authenticated, allowing access to public route');
      return true;
    }

    // If authenticated, redirect to appropriate dashboard
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      console.log('PublicGuard: User authenticated, redirecting to dashboard');
      switch (currentUser.role) {
        case 'ADMIN':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'LENDER':
          this.router.navigate(['/lender/dashboard']);
          break;
        case 'BORROWER':
          this.router.navigate(['/borrower/dashboard']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    }
    
    return false;
  }
}

// Export the class references for backward compatibility
export const authGuard = AuthGuard;
export const publicGuard = PublicGuard;
