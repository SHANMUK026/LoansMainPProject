import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: false
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    Object.defineProperty(mockAuthService, 'isAuthenticated', {
      get: () => true
    });

    const result = guard.canActivate();
    expect(result).toBeTruthy();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to login when user is not authenticated', () => {
    Object.defineProperty(mockAuthService, 'isAuthenticated', {
      get: () => false
    });

    const result = guard.canActivate();
    expect(result).toBeFalsy();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle route activation correctly', () => {
    // Test with authenticated user
    Object.defineProperty(mockAuthService, 'isAuthenticated', {
      get: () => true
    });

    const result = guard.canActivate();
    expect(result).toBeTruthy();

    // Test with unauthenticated user
    Object.defineProperty(mockAuthService, 'isAuthenticated', {
      get: () => false
    });

    const result2 = guard.canActivate();
    expect(result2).toBeFalsy();
  });
});
