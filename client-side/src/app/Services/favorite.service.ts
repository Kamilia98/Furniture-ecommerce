import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map, first, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NgToastService } from 'ng-angular-popup';
import { ProductFavorite } from '../Models/productFavorite.model';
import { ModalService } from './modal.service';
import { LoginPromptModalComponent } from '../Components/modals/login-prompt-modal/login-prompt-modal.component';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/users`;
  private favoritesSubject = new BehaviorSubject<ProductFavorite[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: NgToastService,
    private modalService: ModalService,
  ) {
    this.authService.isLoggedIn$.subscribe((status) => {
      if (status) this.loadFavorites();
      else {
        this.favoritesSubject.next([]);
      }
    });
  }

  /*** AUTHORIZATION HEADER ***/
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /*** FAVORITES FETCHING ***/
  private loadFavorites(): void {
    this.getFavorites().subscribe();
  }

  getFavorites(): Observable<ProductFavorite[]> {
    return this.http
      .get<{ data: { favourites: any[] } }>(`${this.apiUrl}/favourites`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map((response) => this.mapFavorites(response.data.favourites)),
        tap((favorites) => this.favoritesSubject.next(favorites)),
        catchError((error) => this.handleFavoriteError(error, [])),
      );
  }

  /*** TOGGLE FAVORITE (ADD/REMOVE) ***/
  toggleFavourite(id: string): Observable<ProductFavorite[]> {
    let name = this.getStoredname(id); // Store name before removing

    return this.authService.isLoggedIn$.pipe(
      first(),
      switchMap((isLoggedIn) => {
        if (!isLoggedIn) {
          this.modalService.show(LoginPromptModalComponent);
          console.error('User is not logged in. Prompting for login.');
          return of(this.favoritesSubject.getValue());
        }

        return this.http
          .post<{
            data: { favourites: any[] };
          }>(`${this.apiUrl}/toggle-favourites`, { id }, { headers: this.getAuthHeaders() })
          .pipe(
            map((response) => this.mapFavorites(response.data.favourites)),
            tap((favorites) => {
              this.favoritesSubject.next(favorites);

              // Fetch name after adding
              if (!name) {
                name = this.getFetchedname(id, favorites);
              }

              this.showFavoriteToast(id, name);
            }),
            catchError((error) =>
              this.handleFavoriteError(error, this.favoritesSubject.getValue()),
            ),
          );
      }),
    );
  }

  isInFavorites(id: string): boolean {
    return this.favoritesSubject.getValue().some((p) => p.id === id);
  }

  /*** FAVORITE NAME HANDLINGE ***/
  private getStoredname(id: string): string | null {
    const product = this.favoritesSubject.getValue().find((p) => p.id === id);
    return product ? product.name : null;
  }

  private getFetchedname(id: string, favorites: ProductFavorite[]): string {
    const product = favorites.find((p) => p.id === id);
    return product ? product.name : 'Product';
  }

  /*** API RESPONSE MAPPING  ***/
  private mapFavorites(apiFavorites: any[]): ProductFavorite[] {
    return apiFavorites.map((p) => ({
      id: p._id,
      name: p.name,
      image: p.image,
      subTitle: p.subtitle,
    }));
  }

  /*** ERROR HANDLING ***/
  private handleFavoriteError(
    error: any,
    fallbackValue: ProductFavorite[],
  ): Observable<ProductFavorite[]> {
    console.error('Error updating favorites:', error);
    this.toast.danger('Failed to update favorites. Please try again.');
    return of(fallbackValue);
  }

  /*** UI TOAST MESSAGES ***/
  private showFavoriteToast(id: string, name: string): void {
    const isFavoriteNow = this.isInFavorites(id);
    const action = isFavoriteNow ? 'added to' : 'removed from';
    this.toast.success(`${name} has been ${action} your favorites.`);
  }
}
