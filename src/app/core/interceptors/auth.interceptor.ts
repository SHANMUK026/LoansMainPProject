import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth token to requests if available
  if (authService.isAuthenticated) {
    request = addToken(request, authService);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  // For demo purposes, we'll add a custom header
  // In a real app, you'd add the Authorization header
  return request.clone({
    setHeaders: {
      'X-Auth-Token': 'Bearer ' + authService.authToken
    }
  });
}
