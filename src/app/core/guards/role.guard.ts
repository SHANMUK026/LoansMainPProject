import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CanActivateFn } from '@angular/router';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('RoleGuard: Checking role access...');
  console.log('RoleGuard: requiredRoles =', route.data['roles']);
  console.log('RoleGuard: currentUser role =', authService.currentUser?.role);

  const requiredRoles = route.data['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    console.log('RoleGuard: No roles required, allowing access');
    return true;
  }

  const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));
  console.log('RoleGuard: hasRequiredRole =', hasRequiredRole);
  
  if (hasRequiredRole) {
    console.log('RoleGuard: User has required role, allowing access');
    return true;
  }

  console.log('RoleGuard: User does not have required role, redirecting');
  router.navigate(['/dashboard']);
  return false;
};
