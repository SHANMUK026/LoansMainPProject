import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LandingComponent } from './landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BorrowerDashboardComponent } from './features/borrower/borrower-dashboard/borrower-dashboard.component';
import { LoanCalculatorComponent } from './features/borrower/loan-calculator/loan-calculator.component';
import { SmartMatchingComponent } from './features/borrower/smart-matching/smart-matching.component';
import { DocumentManagementComponent } from './features/borrower/document-management/document-management.component';
import { BorrowerProfileComponent } from './features/borrower/profile/borrower-profile.component';
import { BorrowerApplyLoanComponent } from './features/borrower/apply-loan/borrower-apply-loan.component';
import { BorrowerMyApplicationsComponent } from './features/borrower/my-applications/borrower-my-applications.component';
import { BorrowerEligibilityCheckComponent } from './features/borrower/eligibility-check/borrower-eligibility-check.component';
import { LenderDashboardComponent } from './features/lender/lender-dashboard/lender-dashboard.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AnalyticsDashboardComponent } from './features/admin/analytics-dashboard/analytics-dashboard.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminLendersComponent } from './features/admin/lenders/admin-lenders.component';
import { AdminApplicationsComponent } from './features/admin/applications/admin-applications.component';
import { AdminSettingsComponent } from './features/admin/settings/admin-settings.component';
import { AdminReportsComponent } from './features/admin/reports/admin-reports.component';
import { LenderProfileComponent } from './features/lender/profile/lender-profile.component';
import { LenderRulesComponent } from './features/lender/rules/lender-rules.component';
import { LenderAnalyticsComponent } from './features/lender/analytics/lender-analytics.component';

export const routes: Routes = [
  { 
    path: '', 
    component: LandingComponent,
    canActivate: [publicGuard]
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [publicGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  
  // Borrower routes - Updated to use consistent prefix
  { 
    path: 'borrower/dashboard', 
    component: BorrowerDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  { 
    path: 'borrower/smart-matching', 
    component: SmartMatchingComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  { 
    path: 'borrower/documents', 
    component: DocumentManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  { 
    path: 'borrower/loan-calculator', 
    component: LoanCalculatorComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  { 
    path: 'borrower/profile', 
    component: BorrowerProfileComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  { 
    path: 'borrower/apply-loan', 
    component: BorrowerApplyLoanComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  { 
    path: 'borrower/my-applications', 
    component: BorrowerMyApplicationsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  { 
    path: 'borrower/eligibility-check', 
    component: BorrowerEligibilityCheckComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['BORROWER'] }
  },
  
  // Lender routes
  { 
    path: 'lender/dashboard', 
    component: LenderDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LENDER'] }
  },
  { 
    path: 'lender/rules', 
    component: LenderRulesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LENDER'] }
  },
  { 
    path: 'lender/profile', 
    component: LenderProfileComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LENDER'] }
  },
  { 
    path: 'lender/analytics', 
    component: LenderAnalyticsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LENDER'] }
  },
  
  // Admin routes
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/analytics', 
    component: AnalyticsDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/users', 
    component: AdminUsersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/lenders', 
    component: AdminLendersComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/applications', 
    component: AdminApplicationsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/settings', 
    component: AdminSettingsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'admin/reports', 
    component: AdminReportsComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  
  { path: '**', redirectTo: '' }
];
