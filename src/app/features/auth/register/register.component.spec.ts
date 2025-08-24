import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('username')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.registerForm;
    expect(form.valid).toBeFalsy();
    
    form.controls['username'].setValue('testuser');
    form.controls['password'].setValue('testpass');
    form.controls['email'].setValue('test@example.com');
    
    expect(form.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailField = component.registerForm.get('email');
    emailField?.setValue('invalid-email');
    emailField?.markAsTouched();
    
    expect(emailField?.invalid).toBeTruthy();
    
    emailField?.setValue('valid@email.com');
    expect(emailField?.valid).toBeTruthy();
  });

  it('should validate password length', () => {
    const passwordField = component.registerForm.get('password');
    passwordField?.setValue('123');
    passwordField?.markAsTouched();
    
    expect(passwordField?.invalid).toBeTruthy();
    
    passwordField?.setValue('12345678');
    expect(passwordField?.valid).toBeTruthy();
  });

  it('should handle successful registration', () => {
    const mockResponse = { 
      id: 1, 
      username: 'newuser', 
      roles: ['BORROWER'], 
      token: 'mock-token' 
    };
    mockAuthService.register.and.returnValue(of(mockResponse));
    
    component.registerForm.patchValue({
      username: 'newuser',
      password: 'newpass123',
      email: 'new@example.com'
    });
    
    component.onSubmit();
    
    expect(mockAuthService.register).toHaveBeenCalledWith({
      username: 'newuser',
      password: 'newpass123',
      email: 'new@example.com'
    });
  });

  it('should handle registration error', () => {
    const mockError = { message: 'Username already exists' };
    mockAuthService.register.and.returnValue(throwError(() => mockError));
    
    component.registerForm.patchValue({
      username: 'existinguser',
      password: 'pass123',
      email: 'existing@example.com'
    });
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Username already exists');
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalsy();
    component.togglePassword();
    expect(component.showPassword).toBeTruthy();
  });

  it('should show field errors correctly', () => {
    const usernameField = component.registerForm.get('username');
    usernameField?.markAsTouched();
    usernameField?.markAsDirty();
    
    expect(component.isFieldInvalid('username')).toBeTruthy();
    expect(component.getFieldError('username')).toContain('Username is required');
  });
});
