import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/profile',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/apply-loan',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/my-applications',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/loan-calculator',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/smart-matching',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/documents',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'borrower/eligibility-check',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'lender/dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'lender/rules',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'lender/profile',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/dashboard',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/analytics',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/users',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/lenders',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/applications',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/settings',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/reports',
    renderMode: RenderMode.Prerender
  },
  // Catch-all for other routes (including dynamic ones)
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
