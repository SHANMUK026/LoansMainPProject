import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('RoleGuard: Checking role access...');
    console.log('RoleGuard: requiredRoles =', route.data['roles']);
    console.log('RoleGuard: currentUser role =', this.authService.currentUser?.role);

    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('RoleGuard: No roles required, allowing access');
      return true;
    }

    const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));
    console.log('RoleGuard: hasRequiredRole =', hasRequiredRole);
    
    if (hasRequiredRole) {
      console.log('RoleGuard: User has required role, allowing access');
      return true;
    }

    console.log('RoleGuard: User does not have required role, redirecting');
    this.router.navigate(['/dashboard']);
    return false;
  }
}

// Export the class reference for backward compatibility
export const roleGuard = RoleGuard;
