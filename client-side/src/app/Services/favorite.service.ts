import { Injectable } from '@angular/core';
import { product } from '../Models/product.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = 'http://localhost:5000/users';
  private favoritesSubject = new BehaviorSubject<product[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Fetch favorites from API and update state
  loadFavorites(): Observable<any> {
    return this.http
      .get<{ data: { favourites: any[] } }>(`${this.apiUrl}/favourites`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => {
          const apiFavorites = response.data.favourites.map((p) => ({
            id: p._id,
            name: p.productName,
            images: p.productImages.length
              ? p.productImages
              : ['/images/products/1.png'],
            subTitle: p.productSubtitle,
            price: p.productPrice,
            quantity: p.productQuantity,
            categories: p.productCategories.map(
              (cat: { catName: string }) => cat.catName
            ),
            date: p.productDate,
            sale: p.productSale,
          }));
          this.favoritesSubject.next(apiFavorites);
        }),
        catchError((error) => {
          console.error('Error fetching favorites:', error);
          return of([]); // Return empty array if API fails
        })
      );
  }

  // Get favorites (reactively)
  getFavourites(): Observable<product[]> {
    return this.favorites$;
  }

  // Toggle favorite and update state
  toggleFavourite(productId: string): Observable<void> {
    return this.http
      .post<void>(
        `${this.apiUrl}/toggle-favourites`,
        { productId },
        { headers: this.getHeaders() }
      )
      .pipe(
        tap(() => {
          let currentFavorites = this.favoritesSubject.getValue();
          const exists = currentFavorites.some((p) => p.id === productId);

          if (exists) {
            currentFavorites = currentFavorites.filter(
              (p) => p.id !== productId
            );
          } else {
            currentFavorites.push({ id: productId } as product);
          }
          console.log(currentFavorites);

          this.favoritesSubject.next(currentFavorites);
        }),
        catchError((error) => {
          console.error('Error toggling favorite:', error);
          return of();
        })
      );
  }
}
