import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Product } from '../Models/product.model';
import { CartService } from './cart.service';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private isLoggedInSubject: BehaviorSubject<boolean>;
  private cartService!: CartService;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private injector: Injector,
  ) {
    this.isLoggedInSubject = new BehaviorSubject<boolean>(
      this.isAuthenticated(),
    );
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();
  }

  private getCartService(): CartService {
    if (!this.cartService) {
      this.cartService = this.injector.get(CartService);
    }
    return this.cartService;
  }

  private handleCartMerge(): void {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length > 0) {
      const cartService = this.getCartService();
      cart.forEach((p: Product) => {
        cartService.addProduct(p, p.quantity);
      });
      localStorage.removeItem('cart');
    }
  }

  signup(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  login(user: any, rememberMe: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user).pipe(
      tap((response: any) => {
        if (response?.data.token) {
          this.storeToken(response.data.token, rememberMe);
          this.isLoggedInSubject.next(true);
          this.handleCartMerge();
          this.navigateToDashboard();
        }
      }),
    );
  }

  logout(): void {
    this.clearToken();
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  googleSignIn(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  handleGoogleLogin(token: string, rememberme: boolean): void {
    if (token) {
      this.storeToken(token, rememberme);
      this.isLoggedInSubject.next(true);
      this.handleCartMerge();
      this.navigateToDashboard();
    }
  }

  getToken(): string | null {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  getRole(): string | null {
    return sessionStorage.getItem('role') || localStorage.getItem('role');
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(password: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { password, token });
  }

  private storeToken(token: string, rememberMe: boolean): void {
    try {
      const decoded: any = jwtDecode(token);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('role', decoded.role);
    } catch (error) {
      console.error('Invalid token received', error);
    }
  }

  private clearToken(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('role');
  }

  private navigateToDashboard(): void {
    const role = this.getRole();
    const targetRoute = role === 'ADMIN' ? '/admin' : '/';
    if (this.router.url !== targetRoute) {
      this.router.navigate([targetRoute]);
    }
  }
}
