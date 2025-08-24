import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        data: {
          roles: ['ADMIN']
        }
      }
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user has required role', () => {
    mockAuthService.hasRole.and.returnValue(true);

    const result = guard.canActivate(mockActivatedRoute.snapshot);
    expect(result).toBeTruthy();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when user does not have required role', () => {
    mockAuthService.hasRole.and.returnValue(false);

    const result = guard.canActivate(mockActivatedRoute.snapshot);
    expect(result).toBeFalsy();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle multiple required roles correctly', () => {
    // Test with route requiring ADMIN role
    Object.defineProperty(mockActivatedRoute.snapshot.data, 'roles', {
      value: ['ADMIN', 'LENDER']
    });

    // User has ADMIN role
    mockAuthService.hasRole.and.callFake((role: string) => role === 'ADMIN');

    const result = guard.canActivate(mockActivatedRoute.snapshot);
    expect(result).toBeTruthy();

    // User has LENDER role
    mockAuthService.hasRole.and.callFake((role: string) => role === 'LENDER');

    const result2 = guard.canActivate(mockActivatedRoute.snapshot);
    expect(result2).toBeTruthy();

    // User has neither role
    mockAuthService.hasRole.and.returnValue(false);

    const result3 = guard.canActivate(mockActivatedRoute.snapshot);
    expect(result3).toBeFalsy();
  });

  it('should handle single required role correctly', () => {
    Object.defineProperty(mockActivatedRoute.snapshot.data, 'roles', {
      value: ['BORROWER']
    });

    // User has BORROWER role
    mockAuthService.hasRole.and.returnValue(true);

    const result = guard.canActivate(mockActivatedRoute.snapshot);
    expect(result).toBeTruthy();

    // User does not have BORROWER role
    mockAuthService.hasRole.and.returnValue(false);

    const result2 = guard.canActivate(mockActivatedRoute.snapshot);
    expect(result2).toBeFalsy();
  });

  it('should redirect to dashboard on access denial', () => {
    mockAuthService.hasRole.and.returnValue(false);

    guard.canActivate(mockActivatedRoute.snapshot);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call hasRole with correct role parameter', () => {
    Object.defineProperty(mockActivatedRoute.snapshot.data, 'roles', {
      value: ['ADMIN']
    });

    mockAuthService.hasRole.and.returnValue(true);
    guard.canActivate(mockActivatedRoute.snapshot);

    expect(mockAuthService.hasRole).toHaveBeenCalledWith('ADMIN');
  });
});
