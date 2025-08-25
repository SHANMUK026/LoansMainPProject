import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'loans';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Validate and clear expired sessions first
    this.authService.validateAndClearExpiredSessions();
    
    // Check authentication state on app initialization
    this.checkAuthState();
  }

  private checkAuthState() {
    // If user is authenticated, redirect to appropriate dashboard
    if (this.authService.isAuthenticated) {
      const currentUser = this.authService.currentUser;
      if (currentUser) {
        switch (currentUser.role) {
          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'LENDER':
            this.router.navigate(['/lender/dashboard']);
            break;
          case 'BORROWER':
            this.router.navigate(['/borrower/dashboard']);
            break;
          default:
            this.router.navigate(['/dashboard']);
        }
      }
    }
  }
}
