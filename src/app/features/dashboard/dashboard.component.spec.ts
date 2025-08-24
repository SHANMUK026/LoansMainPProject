import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'logout'], {
      currentUser: null
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if no current user', () => {
    mockAuthService.currentUser = null;
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should not redirect if user exists', () => {
    mockAuthService.currentUser = {
      id: 1,
      username: 'testuser',
      roles: ['BORROWER'],
      token: 'mock-token'
    };
    component.ngOnInit();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should check user role correctly', () => {
    mockAuthService.hasRole.and.returnValue(true);
    expect(component.hasRole('BORROWER')).toBeTruthy();
    expect(mockAuthService.hasRole).toHaveBeenCalledWith('BORROWER');
  });

  it('should return correct role display names', () => {
    expect(component.getRoleDisplayName('ADMIN')).toBe('Administrator');
    expect(component.getRoleDisplayName('LENDER')).toBe('Lender');
    expect(component.getRoleDisplayName('BORROWER')).toBe('Borrower');
    expect(component.getRoleDisplayName('UNKNOWN')).toBe('User');
    expect(component.getRoleDisplayName(undefined)).toBe('User');
  });

  it('should return correct grid class for different roles', () => {
    mockAuthService.hasRole.and.callFake((role: string) => {
      if (role === 'ADMIN') return true;
      return false;
    });
    
    expect(component.getTilesGridClass()).toBe('grid grid--3 gap--lg');
    
    mockAuthService.hasRole.and.callFake((role: string) => {
      if (role === 'LENDER') return true;
      return false;
    });
    
    expect(component.getTilesGridClass()).toBe('grid grid--3 gap--lg');
    
    mockAuthService.hasRole.and.callFake((role: string) => {
      if (role === 'BORROWER') return true;
      return false;
    });
    
    expect(component.getTilesGridClass()).toBe('grid grid--3 gap--lg');
    
    mockAuthService.hasRole.and.returnValue(false);
    expect(component.getTilesGridClass()).toBe('grid grid--1 gap--lg');
  });

  it('should call logout on auth service', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should display user information correctly', () => {
    mockAuthService.currentUser = {
      id: 1,
      username: 'testuser',
      roles: ['BORROWER'],
      token: 'mock-token'
    };
    
    component.ngOnInit();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.user__name').textContent).toContain('testuser');
  });
});
