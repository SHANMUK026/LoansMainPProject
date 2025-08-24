import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { MockApiService } from './mock-api.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockApiService: jasmine.SpyObj<MockApiService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('MockApiService', ['login', 'register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: MockApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    mockApiService = TestBed.inject(MockApiService) as jasmine.SpyObj<MockApiService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return current user', () => {
    expect(service.currentUser).toBeNull();
  });

  it('should return authentication status', () => {
    expect(service.isAuthenticated).toBeFalsy();
  });

  it('should check user roles correctly', () => {
    const hasRole = service.hasRole;
    expect(hasRole('ADMIN')).toBeFalsy();
    expect(hasRole('LENDER')).toBeFalsy();
    expect(hasRole('BORROWER')).toBeFalsy();
  });

  it('should handle successful login', (done) => {
    const mockResponse = {
      id: 1,
      username: 'testuser',
      roles: ['BORROWER'],
      token: 'mock-token'
    };

    mockApiService.login.and.returnValue(of(mockResponse));

    service.login({ username: 'testuser', password: 'testpass' }).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        expect(service.currentUser).toEqual({
          id: 1,
          username: 'testuser',
          roles: ['BORROWER'],
          token: 'mock-token'
        });
        expect(service.isAuthenticated).toBeTruthy();
        done();
      },
      error: done.fail
    });
  });

  it('should handle login error', (done) => {
    const mockError = { message: 'Invalid credentials' };
    mockApiService.login.and.returnValue(throwError(() => mockError));

    service.login({ username: 'testuser', password: 'wrongpass' }).subscribe({
      next: () => done.fail('Should have failed'),
      error: (error) => {
        expect(error).toEqual(mockError);
        expect(service.currentUser).toBeNull();
        expect(service.isAuthenticated).toBeFalsy();
        done();
      }
    });
  });

  it('should handle successful registration', (done) => {
    const mockResponse = {
      id: 2,
      username: 'newuser',
      roles: ['BORROWER'],
      token: 'new-token'
    };

    mockApiService.register.and.returnValue(of(mockResponse));

    service.register({ username: 'newuser', password: 'newpass', email: 'new@test.com' }).subscribe({
      next: (response) => {
        expect(response).toEqual(mockResponse);
        expect(service.currentUser).toEqual({
          id: 2,
          username: 'newuser',
          roles: ['BORROWER'],
          token: 'new-token'
        });
        expect(service.isAuthenticated).toBeTruthy();
        done();
      },
      error: done.fail
    });
  });

  it('should handle registration error', (done) => {
    const mockError = { message: 'Username already exists' };
    mockApiService.register.and.returnValue(throwError(() => mockError));

    service.register({ username: 'existinguser', password: 'pass', email: 'existing@test.com' }).subscribe({
      next: () => done.fail('Should have failed'),
      error: (error) => {
        expect(error).toEqual(mockError);
        expect(service.currentUser).toBeNull();
        expect(service.isAuthenticated).toBeFalsy();
        done();
      }
    });
  });

  it('should logout user correctly', () => {
    // Set a mock user first
    service['currentUserSubject'].next({
      id: 1,
      username: 'testuser',
      roles: ['BORROWER'],
      token: 'mock-token'
    });

    expect(service.isAuthenticated).toBeTruthy();

    service.logout();

    expect(service.currentUser).toBeNull();
    expect(service.isAuthenticated).toBeFalsy();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should check if user has any of required roles', () => {
    // Set a mock user with BORROWER role
    service['currentUserSubject'].next({
      id: 1,
      username: 'testuser',
      roles: ['BORROWER'],
      token: 'mock-token'
    });

    expect(service.hasAnyRole(['BORROWER', 'LENDER'])).toBeTruthy();
    expect(service.hasAnyRole(['ADMIN'])).toBeFalsy();
    expect(service.hasAnyRole(['LENDER', 'ADMIN'])).toBeFalsy();
  });

  it('should restore user from localStorage on initialization', () => {
    const mockUser = {
      id: 1,
      username: 'storeduser',
      roles: ['LENDER'],
      token: 'stored-token'
    };

    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));

    // Create a new instance to trigger localStorage check
    const newService = new AuthService(mockApiService, mockRouter);
    
    expect(newService.currentUser).toEqual(mockUser);
    expect(newService.isAuthenticated).toBeTruthy();
  });
});
