import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '../models/auth-response.model';
import { User } from '../models/roles.model';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private token: string | null = null;
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    // Initialize current user from localStorage
    this.currentUserSubject.next(this.getStoredUser());
    this.token = this.getStoredToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role || false;
  }

  login(username: string, password: string): Observable<AuthResponse> {
    // First, get all users from JSON Server
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      map(users => {
        // Find user by username
        const user = users.find(u => u.username === username);
        
        if (!user) {
          throw new Error('User not found');
        }

        // In a real app, you'd verify password hash
        // For demo purposes, we'll assume password is correct if user exists
        if (password !== 'password123') {
          throw new Error('Invalid password');
        }

        // Generate a mock JWT token
        const token = `jwt-token-${user.id}-${Date.now()}`;
        
        const response: AuthResponse = {
          user: user,
          token: token,
          message: 'Login successful'
        };

        return response;
      }),
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.token = response.token;
        this.setStoredUser(response.user);
        this.setStoredToken(response.token);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error(error.message || 'Login failed'));
      })
    );
  }

  register(userData: User): Observable<AuthResponse> {
    // First check if username already exists
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      map(users => {
        const existingUser = users.find(u => u.username === userData.username);
        if (existingUser) {
          throw new Error('Username already exists');
        }
        return users;
      }),
      // Then create new user
      map(users => {
        const newUser: User = {
          ...userData,
          id: Math.max(...users.map(u => Number(u.id) || 0), 0) + 1
        };
        return newUser;
      }),
      // Save user to JSON Server
      map(newUser => {
        this.http.post<User>(`${this.baseUrl}/users`, newUser).subscribe();
        
        // Generate a mock JWT token
        const token = `jwt-token-${newUser.id}-${Date.now()}`;
        
        const response: AuthResponse = {
          user: newUser,
          token: token,
          message: 'Registration successful'
        };

        return response;
      }),
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.token = response.token;
        this.setStoredUser(response.user);
        this.setStoredToken(response.token);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error(error.message || 'Registration failed'));
      })
    );
  }

  logout(): void {
    console.log('AuthService logout called');
    console.log('Current user before logout:', this.currentUser);
    this.currentUserSubject.next(null);
    this.token = null;
    this.setStoredUser(null);
    this.setStoredToken(null);
    console.log('User logged out successfully');
  }

  // Helper method to check if user has any of the required roles
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Helper method to safely access localStorage
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getStoredUser(): User | null {
    if (!this.isBrowser()) return null;
    
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  private setStoredUser(user: User | null): void {
    if (!this.isBrowser()) return;
    
    try {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (error) {
      console.error('Error storing user:', error);
    }
  }

  private getStoredToken(): string | null {
    if (!this.isBrowser()) return null;
    
    try {
      return localStorage.getItem('token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  private setStoredToken(token: string | null): void {
    if (!this.isBrowser()) return;
    
    try {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }
}
