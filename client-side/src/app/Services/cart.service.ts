import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { product } from '../Models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartService implements OnInit {
  private apiUrl = 'http://localhost:5000/cart';
  isLoggedIn = false;

  private cartSubject = new BehaviorSubject<product[]>([]);
  cart$ = this.cartSubject.asObservable();

  private checkoutSubject = new BehaviorSubject<product[]>([]);
  checkoutData$ = this.checkoutSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private getGuestCart(): product[] {
    const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');

    return guestCart.map((p: any) => ({
      id: p.id,
      name: p.name,
      images: p.images?.length ? p.images : ['/images/products/1.jpg'],
      subTitle: p.subTitle,
      price: p.price,
      quantity: p.quantity,
      categories: p.categories || [],
      date: p.date || null,
      sale: p.sale || 0,
    }));
  }

  private saveGuestCart(cart: product[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  getCart(): Observable<product[]> {
    if (this.isLoggedIn) {
      return this.http.get<{ data: { products: any[] } }>(this.apiUrl).pipe(
        map(({ data }) =>
          data.products.map((p) => ({
            id: p._id,
            name: p.productName,
            images: p.productImages,
            subTitle: p.productSubtitle,
            price: p.productPrice,
            quantity: p.productQuantity,
            categories: p.productCategories.map(
              (cat: { catName: string }) => cat.catName
            ),
            date: p.productDate,
            sale: p.productSale,
          }))
        ),
        catchError((error) => {
          console.error('Error fetching products:', error);
          return of([]);
        })
      );
    } else {
      const guestCart = this.getGuestCart();
      if (
        JSON.stringify(this.cartSubject.getValue()) !==
        JSON.stringify(guestCart)
      ) {
        this.cartSubject.next(guestCart);
      }
      return of(guestCart);
    }
  }

  updateCart(cart: product[]): void {
    const currentCart = this.cartSubject.getValue();
    if (
      cart.length === currentCart.length &&
      cart.every((p, i) => p.id === currentCart[i]?.id)
    ) {
      return;
    }
    this.cartSubject.next(cart);
  }

  addProduct(product: product): void {
    const cart = [...this.cartSubject.getValue()];
    if (!cart.some((p) => p.id === product.id)) {
      cart.push({ ...product, quantity: 1 });
      this.updateCart(cart);

      if (this.isLoggedIn) {
        this.http
          .post(this.apiUrl, [{ productId: product.id, quantity: 1 }], {
            headers: this.getAuthHeaders(),
          })
          .subscribe();
      } else {
        this.saveGuestCart(cart);
      }
    }
  }

  removeProduct(productId: string): void {
    const updatedCart = this.cartSubject
      .getValue()
      .filter((p) => p.id !== productId);

    if (updatedCart.length !== this.cartSubject.getValue().length) {
      this.updateCart(updatedCart);
      if (!this.isLoggedIn) {
        this.saveGuestCart(updatedCart);
      }
    }
  }

  private modifyQuantity(productId: string, change: number): void {
    const cart = [...this.cartSubject.getValue()];
    const product = cart.find((p) => p.id === productId);

    if (product) {
      product.quantity = Math.max(1, product.quantity + change);
      this.updateCart(cart);

      if (this.isLoggedIn) {
        this.http
          .patch(
            this.apiUrl,
            { productId, quantity: product.quantity },
            { headers: this.getAuthHeaders() }
          )
          .subscribe();
      } else {
        this.saveGuestCart(cart);
      }
    }
  }

  increaseQuantity(productId: string): void {
    this.modifyQuantity(productId, 1);
  }

  decreaseQuantity(productId: string): void {
    this.modifyQuantity(productId, -1);
  }

  getSubtotal(): number {
    return this.cartSubject
      .getValue()
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  setCheckoutData(): void {
    this.checkoutSubject.next([...this.cartSubject.getValue()]);
  }

  getCheckoutData(): product[] {
    return this.checkoutSubject.getValue();
  }

  isInCart(productId: string): boolean {
    return this.cartSubject.getValue().some((p) => p.id === productId);
  }

  clearCart(): void {
    this.cartSubject.next([]);
    this.checkoutSubject.next([]);
    localStorage.removeItem('cart');
  }
}
