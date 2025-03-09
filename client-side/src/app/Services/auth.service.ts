import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/register';
  private isLoggedInSubject: BehaviorSubject<boolean>;
  isLoggedIn$: Observable<boolean>;
  constructor(private http: HttpClient, private router: Router) {
    const tokenExists =
      !!sessionStorage.getItem('token') || !!localStorage.getItem('token');
    this.isLoggedInSubject = new BehaviorSubject<boolean>(tokenExists);
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();
  }

  signup(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }
  login(user: any): Observable<any> {
    this.isLoggedInSubject.next(true);
    return this.http.post(`${this.apiUrl}/login`, user);
  }
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/register/login']);
  }
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  isLoggedIn(): boolean {
    this.isLoggedInSubject.next(false);
    return !!localStorage.getItem('token');
  }
  getRole(): string | null {
    return localStorage.getItem('role');
  }
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(password: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { password, token });
  }
}
