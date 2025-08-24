import { TestBed } from '@angular/core/testing';
import { MockApiService } from './mock-api.service';
import { of, throwError } from 'rxjs';

describe('MockApiService', () => {
  let service: MockApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockApiService]
    });
    service = TestBed.inject(MockApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should return success for valid admin credentials', (done) => {
      service.login({ username: 'admin', password: 'admin123' }).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.username).toBe('admin');
          expect(response.roles).toContain('ADMIN');
          expect(response.token).toBeTruthy();
          done();
        },
        error: done.fail
      });
    });

    it('should return success for valid lender credentials', (done) => {
      service.login({ username: 'lender1', password: 'lender123' }).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.username).toBe('lender1');
          expect(response.roles).toContain('LENDER');
          expect(response.token).toBeTruthy();
          done();
        },
        error: done.fail
      });
    });

    it('should return success for valid borrower credentials', (done) => {
      service.login({ username: 'borrower1', password: 'borrower123' }).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.username).toBe('borrower1');
          expect(response.roles).toContain('BORROWER');
          expect(response.token).toBeTruthy();
          done();
        },
        error: done.fail
      });
    });

    it('should return error for invalid credentials', (done) => {
      service.login({ username: 'invalid', password: 'wrong' }).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.success).toBeFalsy();
          expect(error.message).toContain('Invalid credentials');
          done();
        }
      });
    });
  });

  describe('register', () => {
    it('should return success for new user registration', (done) => {
      service.register({ username: 'newuser', password: 'newpass', email: 'new@test.com' }).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.username).toBe('newuser');
          expect(response.roles).toContain('BORROWER');
          expect(response.token).toBeTruthy();
          done();
        },
        error: done.fail
      });
    });

    it('should return error for existing username', (done) => {
      service.register({ username: 'admin', password: 'newpass', email: 'admin@test.com' }).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.success).toBeFalsy();
          expect(error.message).toContain('Username already exists');
          done();
        }
      });
    });
  });

  describe('getLenderRules', () => {
    it('should return array of lender rules', (done) => {
      service.getLenderRules().subscribe({
        next: (rules) => {
          expect(Array.isArray(rules)).toBeTruthy();
          expect(rules.length).toBeGreaterThan(0);
          expect(rules[0]).toHaveProperty('id');
          expect(rules[0]).toHaveProperty('minSalary');
          expect(rules[0]).toHaveProperty('maxLoanAmount');
          done();
        },
        error: done.fail
      });
    });
  });

  describe('createLoanApplication', () => {
    it('should return success for valid application', (done) => {
      const application = {
        requestedAmount: 50000,
        purpose: 'Home Renovation',
        userId: 1
      };

      service.createLoanApplication(application).subscribe({
        next: (response) => {
          expect(response.success).toBeTruthy();
          expect(response.application).toBeTruthy();
          expect(response.application.requestedAmount).toBe(50000);
          done();
        },
        error: done.fail
      });
    });

    it('should return error for invalid application', (done) => {
      const application = {
        requestedAmount: -1000,
        purpose: '',
        userId: 1
      };

      service.createLoanApplication(application).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.success).toBeFalsy();
          expect(error.message).toContain('Invalid application');
          done();
        }
      });
    });
  });

  describe('checkEligibility', () => {
    it('should return eligibility results for valid application', (done) => {
      const application = {
        id: 1,
        requestedAmount: 50000,
        purpose: 'Home Renovation',
        userId: 1
      };

      service.checkEligibility(application).subscribe({
        next: (results) => {
          expect(Array.isArray(results)).toBeTruthy();
          expect(results.length).toBeGreaterThan(0);
          expect(results[0]).toHaveProperty('eligible');
          expect(results[0]).toHaveProperty('lenderName');
          done();
        },
        error: done.fail
      });
    });

    it('should handle application not found error', (done) => {
      const application = null;

      service.checkEligibility(application).subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe('Application not found');
          done();
        }
      });
    });
  });

  describe('getLoanApplications', () => {
    it('should return array of loan applications', (done) => {
      service.getLoanApplications(1).subscribe({
        next: (applications) => {
          expect(Array.isArray(applications)).toBeTruthy();
          expect(applications.length).toBeGreaterThan(0);
          expect(applications[0]).toHaveProperty('id');
          expect(applications[0]).toHaveProperty('status');
          done();
        },
        error: done.fail
      });
    });
  });

  describe('getUsers', () => {
    it('should return array of users', (done) => {
      service.getUsers().subscribe({
        next: (users) => {
          expect(Array.isArray(users)).toBeTruthy();
          expect(users.length).toBeGreaterThan(0);
          expect(users[0]).toHaveProperty('id');
          expect(users[0]).toHaveProperty('username');
          expect(users[0]).toHaveProperty('roles');
          done();
        },
        error: done.fail
      });
    });
  });
});
