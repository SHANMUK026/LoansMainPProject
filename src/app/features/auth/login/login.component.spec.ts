import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.loginForm;
    expect(form.valid).toBeFalsy();
    
    form.controls['username'].setValue('testuser');
    form.controls['password'].setValue('testpass');
    
    expect(form.valid).toBeTruthy();
  });

  it('should show error for invalid field', () => {
    const usernameField = component.loginForm.get('username');
    usernameField?.markAsTouched();
    usernameField?.markAsDirty();
    
    expect(component.isFieldInvalid('username')).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalsy();
    component.togglePassword();
    expect(component.showPassword).toBeTruthy();
  });

  it('should handle successful login', () => {
    const mockResponse = { id: 1, username: 'testuser', roles: ['BORROWER'], token: 'mock-token' };
    mockAuthService.login.and.returnValue(of(mockResponse));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpass'
    });
    
    component.onSubmit();
    
    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'testpass'
    });
  });

  it('should handle login error', () => {
    const mockError = { message: 'Invalid credentials' };
    mockAuthService.login.and.returnValue(throwError(() => mockError));
    
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpass'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
